import {createSectionStore, Section} from "./section";
import {BranchState, BranchStore, NodeStore, TreeState, TreeStore} from "./trackTree";
import {get_store_value} from "svelte/internal";

type TrackTreeDtoRoot = {
    children: TrackTreeDtoBranch[];
}

type TrackTreeDtoBranch = {
    section: Section;
    children: TrackTreeDtoBranch[];
}

function save(tree: TreeStore): TrackTreeDtoRoot {
    return serialise_Root(tree);
}

function serialise_Root(tree: TreeStore): TrackTreeDtoRoot {
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
    const dto: TrackTreeDtoBranch = {
        section: state.section,
        children: []
    };
    Object.values(state.children).forEach(child => {
        dto.children.push(serialise_Branch(child))
    });
    return dto;
}

async function load(tree: TreeStore, serialised: TrackTreeDtoRoot) {
    clearTree(tree);
    await addToTree_Root(tree, serialised);
}

async function addToTree_Root(tree: NodeStore, serialised: TrackTreeDtoRoot) {
    serialised.children.forEach(child => addToTree_Branch(tree, child))
}

async function addToTree_Branch(tree: NodeStore, serialised: TrackTreeDtoBranch) {
    const sectionStore = createSectionStore(serialised.section);
    const newBranch: BranchStore = await tree.addChild(sectionStore);
    serialised.children.forEach(child => addToTree_Branch(newBranch, child))
}

function clearTree(tree: TreeStore) {
    const treeState: TreeState = get_store_value(tree);
    const childIndices = Object.keys(treeState.children).forEach(key => tree.deleteChild(key as any));
    tree.updatePendingLoad(() => 0);
    tree.resetNextChildIndex();
}