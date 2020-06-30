import { derived, Readable, writable } from "svelte/store";
import { SectionState, SectionStore } from "./section";
import { Instrument, instruments } from "../constants";
import { arrayEqual } from "../utils";
import { ProcessedNotes } from "../bridge/postProcessor";
import { CompleteNote, IncompleteNote } from "../bridge/decoder";

type NotesState = {notes: ProcessedNotes};
type NotesStore = Readable<NotesState>;

export function createEmptyNotes(): ProcessedNotes {
  const notes = {} as ProcessedNotes;
  instruments.forEach(instrument => notes[instrument] = []);
  return notes;
}

export function createRootNotesStore(): NotesStore {
  return writable({ notes: createEmptyNotes() });
}
export function createBranchNotesStore(parent: NotesStore, sectionStore: SectionStore): NotesStore {
  let lastParent: ProcessedNotes = createEmptyNotes();
  let lastChild: ProcessedNotes = createEmptyNotes();
  return derived([parent, sectionStore], ([$parent, $sectionStore]: [NotesState, SectionState], set: (newValue: NotesState) => void) => {
    if (notesEquality($parent.notes, lastParent) && notesEquality($sectionStore.section.notes, lastChild)) return;
    lastParent = $parent.notes;
    lastChild = $sectionStore.section.notes;
    const parentNotes: ProcessedNotes = $parent.notes;
    const childNotes: ProcessedNotes = $sectionStore.section.notes;
    const combinedNotes: ProcessedNotes = createEmptyNotes();
    instruments.forEach(instrument => {
      combinedNotes[instrument] = [...parentNotes[instrument], ...childNotes[instrument]];
    });
    set({ notes: combinedNotes });
  }, { notes: createEmptyNotes() });
}

function notesEquality(a: ProcessedNotes, b: ProcessedNotes) {
  for (let instrument of ["bass", "drums", "guitar", "harp", "piano", "violin", "cello", "flute", "trumpet", "clarinet"]) {
    if (!arrayEqual(a[instrument as Instrument], b[instrument as Instrument], noteEquality)) return false;
  }
  return true;
}

function noteEquality(a: CompleteNote | IncompleteNote, b: CompleteNote | IncompleteNote) {
  return a.type === b.type &&
    a.pitch === b.pitch &&
    (a.type === "COMPLETE" ? a.endTime : undefined) === (b.type === "COMPLETE" ? b.endTime : undefined) &&
    a.startTime === b.startTime &&
    a.volume === b.volume;
}

export function createNotesStore(parent: null | ({ type: "root" }) | (Parameters<typeof createBranchNotesStore>[0] & { type: "branch" }), sectionStore: SectionStore): NotesStore {
  if (parent === null) {
    return createRootNotesStore();
  } else if (parent.type === "root") {
    return createBranchNotesStore(createRootNotesStore(), sectionStore);
  } else {
    return createBranchNotesStore(parent, sectionStore);
  }
}