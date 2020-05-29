import {BranchState, BranchStore, NodeState} from "./trackTree";
import {derived, Readable, writable} from "svelte/store";
import {unwrapStoreNonNull} from "../utils";

export function derivePlacementStore(parentStore: Readable<Pick<NodeState, "children">>): Readable<Array<[number, number]>> {
    const nested: Readable<Readable<Array<[number, number]>>> = derived(parentStore, ({children}: Pick<NodeState, "children">) => {
        const childStores: BranchStore[] = Object.values(children);
        if(childStores.length === 0) return writable([]);
        const leafStores: Array<Readable<[number, number]>> = childStores.map(store =>
            derived<[BranchStore, Readable<number>], [number, number]>([store, store.numberOfLeavesStore], ([state, numberOfLeaves]: [BranchState, number]) => [state.path[state.path.length - 1], numberOfLeaves])
        );
        const xPositionsStore: Readable<Array<[number, number]>> = derived(leafStores as [Readable<[number, number]>, ...Readable<[number, number]>[]], (leafState: Array<[number, number]>) => {
            let x: number = 0;
            const output: Array<[number, number]> = [];
            leafState.forEach(([idx, leaves]) => {
                output.push([idx, x + leaves/2]);
                x += leaves;
            })
            return output;
        });
        return xPositionsStore;
    });
    return unwrapStoreNonNull<Array<[number, number]>, Readable<Array<[number, number]>>>(nested, [], placementEquality);
}

function placementEquality(a: Array<[number, number]>, b: Array<[number, number]>) {
    if(a === b) return true;
    if(a.length !== b.length) return false;
    for(let i = 0; i < a.length; i++) {
        if(a[i][0] !== b[i][0]) return false;
        if(a[i][1] !== b[i][1]) return false;
    }
    return true;
}