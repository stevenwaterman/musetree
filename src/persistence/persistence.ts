import { createSectionStore, Section, SectionStore } from "../state/section";
import {
  NodeState,
  NodeStore,
  TreeState,
  TreeStore
} from "../state/trackTree";
import { get_store_value } from "svelte/internal";
import { render } from "../audio/audioRender";
import download from "downloadjs";
import { decode, noProcessedActiveNotes } from "../bridge/decoder";
import { encodingToArray, MusenetEncoding } from "../state/encoding";
import { writable, Writable } from "svelte/store";
import { CancellablePromise, makeCancellable } from "./cancelPromise";
import { SerialisedBranch, SerialisedRoot } from "../state/serialisation";
import { ProcessedActiveNotes, postProcess } from "../bridge/postProcessor";
import { instruments } from "../constants";

export type LoadingProgressState = null | {
  done: number;
  total: number;
}
export const loadingProgressStore: Writable<LoadingProgressState> = writable(null);

let loadingPromise: CancellablePromise<TrackTreeDomainRoot> | null = null;
let loadingMidiPromise: CancellablePromise<SectionStore> | null = null;

export function cancelLoading() {
  if (loadingPromise) loadingPromise.cancel();
  if (loadingMidiPromise) loadingMidiPromise.cancel();
}

type TrackTreeDomainRoot = {
  children: TrackTreeDomainBranch[];
}

type TrackTreeDomainBranch = {
  children: TrackTreeDomainBranch[];
  sectionStore: SectionStore;
}

export function save(tree: TreeStore): void {
  const json: string = get_store_value(tree.serialisedStore);
  download(json, "Save.mst");
}

function totalEncodingLength_Root(tree: SerialisedRoot): number {
  return tree.children.map(totalEncodingLength_Branch).reduce((a, b) => a + b, 0);
}

function totalEncodingLength_Branch(tree: SerialisedBranch): number {
  return encodingToArray(tree.encoding).length + tree.children.map(totalEncodingLength_Branch).reduce((a, b) => a + b, 0);
}

let cancelled = false;

export async function load(tree: TreeStore, json: string) {
  cancelled = false;
  const deserialised: SerialisedRoot = JSON.parse(json);

  loadingProgressStore.set({
    done: 0,
    total: totalEncodingLength_Root(deserialised)
  })

  const innerLoadingPromise: Promise<TrackTreeDomainRoot> = load_inner_root(deserialised);
  loadingPromise = makeCancellable(innerLoadingPromise);

  await loadingPromise.then(async (newTree: TrackTreeDomainRoot) => {
    clearTree(tree);
    for (let child of newTree.children) {
      await addToTree(tree, child);
    }
  }).catch(reason => {
    if ("cancelled"! in reason) console.log(`promise rejected, reason: ${reason}`);
    else cancelled = true;
  })

  loadingProgressStore.set(null);
}

export async function loadMidi(encoding: MusenetEncoding, sectionStartsAt: number, sectionEndsAt: number, importUnderStore: NodeStore) {
  cancelled = false;
  loadingProgressStore.set({ done: 0, total: encoding.length });

  const parentState: NodeState = get_store_value(importUnderStore);
  const parentActiveNotesAtEnd = parentState.type === "root" ? noProcessedActiveNotes() : parentState.section.activeNotesAtEnd;

  const innerLoadingPromise: Promise<SectionStore> = loadMidi_inner(encoding, parentActiveNotesAtEnd, sectionStartsAt, sectionEndsAt);
  loadingMidiPromise = makeCancellable(innerLoadingPromise);

  await loadingMidiPromise.then((sectionStore: SectionStore) => {
    importUnderStore.addChild(sectionStore)
  }).catch(reason => {
    if ("cancelled"! in reason) console.log(`promise rejected, reason: ${reason}`);
    else cancelled = true;
  })

  loadingProgressStore.set(null);
}

async function loadMidi_inner(encodingArray: MusenetEncoding, parentActiveNotes: ProcessedActiveNotes, parentStartsAt: number, parentEndsAt: number): Promise<SectionStore> {
  const section = await createSectionFromEncoding(encodingArray, parentActiveNotes, parentStartsAt, parentEndsAt)
  return createSectionStore(section);
}

async function load_inner_root(serialised: SerialisedRoot): Promise<TrackTreeDomainRoot> {
  const children: TrackTreeDomainBranch[] = await Promise.all(serialised.children.map(child => load_inner_branch(0, 0, noProcessedActiveNotes(), child)));
  return { children };
}

async function load_inner_branch(parentStartAt: number, parentEndsAt: number, parentActiveNotes: ProcessedActiveNotes, { encoding, children }: SerialisedBranch): Promise<TrackTreeDomainBranch> {
  if (cancelled) throw new Error("Cancelled");

  const encodingArray = encodingToArray(encoding);
  const section = await createSectionFromEncoding(encodingArray, parentActiveNotes, parentStartAt, parentEndsAt);

  if (cancelled) throw new Error("Cancelled");

  const domainChildrenPromise = Promise.all(children.map(child => load_inner_branch(section.startsAt, section.endsAt, section.activeNotesAtEnd, child)));
  const sectionStore = createSectionStore(section);

  if (cancelled) throw new Error("Cancelled");

  loadingProgressStore.update(state => {
    if (state === null) return null;
    return { ...state, done: state.done + encodingArray.length };
  });
  const domainChildren = await domainChildrenPromise;
  return {
    sectionStore,
    children: domainChildren
  }
}

async function addToTree(parent: NodeStore, child: TrackTreeDomainBranch) {
  const subtree = await parent.addChild(child.sectionStore);
  for (let grandChild of child.children) {
    await addToTree(subtree, grandChild)
  }
}

function clearTree(tree: TreeStore) {
  const treeState: TreeState = get_store_value(tree);
  Object.keys(treeState.children).forEach(key => tree.deleteChild(key as any));
  tree.updatePendingLoad(() => 0);
  tree.resetNextChildIndex();
}

export async function createSectionFromEncoding(originalEncoding: MusenetEncoding, activeNotesAtEnd: ProcessedActiveNotes, parentStartsAt: number, parentEndsAt: number): Promise<Section> {
  const parentDuration = parentEndsAt - parentStartsAt;

  const activeNotesAtStart: ProcessedActiveNotes = noProcessedActiveNotes();
  instruments.forEach(instrument => Object.values(activeNotesAtEnd[instrument]).forEach(note => activeNotesAtStart[instrument][note.pitch] = {...note, startTime: note.startTime - parentDuration}));
  
  const decoded = decode(originalEncoding, activeNotesAtStart);
  const processed = postProcess(decoded);
  const audio = await render(processed.notes, processed.activeAtEnd, processed.duration);
  const endsAt = parentEndsAt + processed.duration;
  return {
    encoding: processed.encoding,
    notes: processed.notes,
    activeNotesAtEnd: processed.activeAtEnd,
    startsAt: parentEndsAt,
    endsAt,
    audio
  };
}