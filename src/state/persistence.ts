import {createSectionStore, Section} from "./section";
import {BranchState, BranchStore, NodeStore, TreeState, TreeStore} from "./trackTree";
import {get_store_value} from "svelte/internal";
import {render} from "../audio/audioRender";
import download from "downloadjs";
import {decode} from "../audio/decoder";

type SectionDto = Omit<Section, "audio">;

type TrackTreeDtoRoot = {
    children: TrackTreeDtoBranch[];
}

type TrackTreeDtoBranch = {
    section: SectionDto;
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
        section: sectionDto,
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
    await Promise.all(serialised.children.map(child => addToTree_Branch(tree, child)));
}

async function addToTree_Branch(tree: NodeStore, serialised: TrackTreeDtoBranch) {
    const duration = serialised.section.endsAt - serialised.section.startsAt;
    const audio = await render(serialised.section.notes, duration);
    const section = {
        ...serialised.section,
        audio
    }
    const sectionStore = createSectionStore(section);
    const newBranch: BranchStore = await tree.addChild(sectionStore);
    await Promise.all(serialised.children.map(child => addToTree_Branch(newBranch, child)));
}

function clearTree(tree: TreeStore) {
    const treeState: TreeState = get_store_value(tree);
    Object.keys(treeState.children).forEach(key => tree.deleteChild(key as any));
    tree.updatePendingLoad(() => 0);
    tree.resetNextChildIndex();
}