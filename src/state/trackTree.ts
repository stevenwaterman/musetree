import {createTree, MutableDecoratedBranchStore, MutableDecoratedRootStore} from "./tree";
import {MusenetEncoding, Track} from "../broker";
import {derived, Readable, writable} from "svelte/store";
import {createEncodingStore} from "./encoding";
import {TrackStore} from "./track";
import {toMidi} from "musenet-midi";
import {unwrapStore} from "../utils";

type BaseDecoration = {
    pendingLoad: number;
}
type RootDecoration = BaseDecoration & {
};
type BranchDecoration = BaseDecoration & {
    encoding: MusenetEncoding,
    track: Track
};

type TreeStore = MutableDecoratedRootStore<RootDecoration, BranchDecoration>;
export type BranchStore = MutableDecoratedBranchStore<RootDecoration, BranchDecoration>;
export type BranchState = Parameters<Parameters<BranchStore["subscribe"]>[0]>[0];
export type NodeStore = TreeStore | BranchStore

export const root: TreeStore = createTree(writable({
    pendingLoad: 0
}));

export function deriveBranchDecorationStore(parentStore: NodeStore | null, trackStore: TrackStore): Readable<BranchDecoration> {
    const encodingStore = createEncodingStore(parentStore, trackStore);
    return derived([trackStore, encodingStore],
        ([$trackStore, $encodingStore]) => ({
            ...$trackStore,
            ...$encodingStore,
            pendingLoad: 0
        })
    );
}

const selectedBranchStore: Readable<BranchState | null> = unwrapStore<BranchState, BranchStore>(root.selectedStore_2);
const currentEncodingStore: Readable<MusenetEncoding | null> = derived(selectedBranchStore, $selected => $selected === null ? null : $selected.encoding);
export const currentMidiStore: Readable<Blob | null> = derived(currentEncodingStore, $encoding => $encoding === null ? null : toMidi($encoding));

