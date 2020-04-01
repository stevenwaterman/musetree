import {createTree, MutableDecoratedBranchStore, MutableDecoratedRootStore} from "./tree";
import {MusenetEncoding, Track} from "../broker";
import {derived, Readable, writable} from "svelte/store";
import {createBranchEncodingStore, createRootEncodingStore, EncodingStore} from "./encoding";
import {TrackStore} from "./track";
import {toMidi} from "musenet-midi";

type RootDecoration = {
};
type BranchDecoration = {
    encoding: MusenetEncoding,
    track: Track
};

type TreeStore = MutableDecoratedRootStore<RootDecoration, BranchDecoration>;
export type BranchStore = MutableDecoratedBranchStore<RootDecoration, BranchDecoration>;
export type BranchState = Parameters<Parameters<BranchStore["subscribe"]>[0]>[0];
type NodeStore = TreeStore | BranchStore

export const root: TreeStore = createTree(writable({}));

function deriveBranchDecorationStore(parentStore: NodeStore, trackStore: TrackStore): Readable<BranchDecoration> {
    const encodingStore: EncodingStore = parentStore.type === "root" ? createRootEncodingStore() : createBranchEncodingStore(parentStore, trackStore);
    return derived([trackStore, encodingStore],
        ([$trackStore, $encodingStore]) => ({
            ...$trackStore,
            ...$encodingStore
        })
    );
}

const selectedTrackStore: Readable<Track | null> = derived(root.selectedStore, $selected => $selected === null ? null : $selected.track);
const currentEncodingStore: Readable<MusenetEncoding | null> = derived(root.selectedStore, $selected => $selected === null ? null : $selected.encoding);
export const currentMidiStore: Readable<Blob | null> = derived(currentEncodingStore, $encoding => $encoding === null ? null : toMidi($encoding));

