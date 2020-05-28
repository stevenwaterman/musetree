import {NodeStore} from "./trackTree";
import {writable, Writable} from "svelte/store";

type State = {
    parentStore: Pick<NodeStore, "showChild">,
    childIdx: number
}[];
const {subscribe, set, update}: Writable<State> = writable([]);
export const undoStore = {
    subscribe,
    onDelete: (parentStore: Pick<NodeStore, "showChild">, childIdx: number) => {
        update((state: State) => [...state, { parentStore, childIdx }]);
        console.log(parentStore, childIdx);
    },
    undo: () => update((state: State) => {
        if(state.length === 0) return state;
        const {parentStore, childIdx} = state[state.length - 1];
        console.log(parentStore, childIdx);
        parentStore.showChild(childIdx);
        return state.slice(0, -1)
    }),
    clear: () => set([])
}

