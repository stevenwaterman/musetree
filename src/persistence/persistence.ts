import {createSectionStore, Section} from "../state/section";
import {BranchState, BranchStore, NodeStore, TreeState, TreeStore} from "../state/trackTree";
import {get_store_value} from "svelte/internal";
import {render} from "../audio/audioRender";
import download from "downloadjs";
import {decode} from "../audio/decoder";
import {encodingToArray, encodingToString, MusenetEncoding} from "../state/encoding";
import {writable, Writable} from "svelte/store";

export const isLoadingStore: Writable<boolean> = writable(false);

type TrackTreeDtoRoot = {
    children: TrackTreeDtoBranch[];
}

type TrackTreeDtoBranch = {
    encoding: string;
    children: TrackTreeDtoBranch[];
}

export function save(tree: TreeStore): void {
    const serialised = serialise_Root(tree);
    const json = JSON.stringify(serialised);
    download(json, "Save.mst");
}

function serialise_Root(tree: TreeStore): TrackTreeDtoRoot
{
    const state: TreeState = get_store_value(tree);
    const dto: TrackTreeDtoRoot = {
        children: []
    };
    Object.values(state.children).forEach(child => {
        dto.children.push(serialise_Branch(child))
    });
    return dto;
}

function serialise_Branch(tree: BranchStore): TrackTreeDtoBranch {
    const state: BranchState = get_store_value(tree);
    const sectionDto = {
        ...state.section
    };
    delete sectionDto.audio;
    const dto: TrackTreeDtoBranch = {
        encoding: encodingToString(state.section.encoding),
        children: []
    };
    Object.values(state.children).forEach(child => {
        dto.children.push(serialise_Branch(child))
    });
    return dto;
}

export async function load(tree: TreeStore, json: string) {
    const serialised: TrackTreeDtoRoot = JSON.parse(json);
    clearTree(tree);
    await addToTree_Root(tree, serialised);
}

async function addToTree_Root(tree: NodeStore, serialised: TrackTreeDtoRoot) {
    await Promise.all(serialised.children.map(child => addToTree_Branch(tree, 0, child)));
}

async function addToTree_Branch(tree: NodeStore, startsAt: number, {encoding, children}: TrackTreeDtoBranch) {
    const encodingArray = encodingToArray(encoding);
    const section = await createSectionFromEncoding(encodingArray, startsAt);
    const sectionStore = createSectionStore(section);
    const newBranch: BranchStore = await tree.addChild(sectionStore);
    await Promise.all(children.map(child => addToTree_Branch(newBranch, section.endsAt, child)));
}

function clearTree(tree: TreeStore) {
    const treeState: TreeState = get_store_value(tree);
    Object.keys(treeState.children).forEach(key => tree.deleteChild(key as any));
    tree.updatePendingLoad(() => 0);
    tree.resetNextChildIndex();
}

export async function createSectionFromEncoding(originalEncoding: MusenetEncoding, startsAt: number): Promise<Section> {
    const {encoding, notes, duration} = await decode(originalEncoding);
    const audio = await render(notes, duration);
    const endsAt = startsAt + duration;
    return {
        encoding: encoding,
        notes,
        startsAt,
        endsAt,
        audio
    };
}