import {
    BranchState,
    BranchStore,
    TreeState,
} from "./trackTree";
import {derived, Readable, writable} from "svelte/store";
import {maybeDerived, unwrapStoreNonNull} from "../utils";
import {encodingToString} from "./encoding";

export type SerialisedRoot = {
    children: SerialisedBranch[];
}

export type SerialisedBranch = {
    encoding: string;
    children: SerialisedBranch[];
}

export function deriveSerialisedBranchStore(branchStore: Readable<BranchState>): Readable<string> {
    const initial: string = JSON.stringify({encoding: "", children: []});
    const nested: Readable<Readable<string>> = derived(branchStore, (branchState: BranchState) => {
        const childMap: Record<number, BranchStore> = branchState.children;
        const childStores: BranchStore[] = Object.values(childMap);
        const serialisedChildStores: Readable<string>[] = childStores.map(store => store.serialisedStore)
        const combinedChildStores: Readable<string[]> = serialisedChildStores.length === 0 ? writable([]) : derived(serialisedChildStores as [Readable<string>, ...Readable<string>[]], (states: string[]) => states);
        const encoding = encodingToString(branchState.section.encoding);
        return maybeDerived(combinedChildStores, (state: string[]) => `{"encoding":"${encoding}","children":[${state.join(",")}]}`, initial);
    });
    return unwrapStoreNonNull<string, Readable<string>>(nested, initial);
}

export function deriveSerialisedRootStore(rootStore: Readable<TreeState>): Readable<string> {
    const initial: string = JSON.stringify({children: []});
    const nested: Readable<Readable<string>> = derived(rootStore, (rootState: TreeState) => {
        const childMap: Record<number, BranchStore> = rootState.children;
        const childStores: BranchStore[] = Object.values(childMap);
        const serialisedChildStores: Readable<string>[] = childStores.map(store => store.serialisedStore)
        const combinedChildStores: Readable<string[]> = serialisedChildStores.length === 0 ? writable([]) : derived(serialisedChildStores as [Readable<string>, ...Readable<string>[]], (states: string[]) => states);
        return maybeDerived(combinedChildStores, (state: string[]) => `{"children":[${state.join(",")}]}`, initial);
    });
    return unwrapStoreNonNull<string, Readable<string>>(nested, initial);
}