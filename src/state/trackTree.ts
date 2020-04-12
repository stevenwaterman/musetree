import {derived, Readable, Writable, writable} from "svelte/store";
import {createEncodingStore, MusenetEncoding} from "./encoding";
import {Track, TrackStore} from "./track";
import {unwrapStore} from "../utils";
import {StateFor} from "./stores";
import {
    createTree,
    StoreDecorationSupplier_Branch,
    StoreDecorationSupplier_Root,
    StoreSafeDecorated_DecoratedState_Branch,
    StoreSafeDecorated_DecoratedState_Root,
    StoreSafePartDecorated_DecoratedState_Branch,
    StoreSafePartDecorated_DecoratedState_Root
} from "./tree";
import {createNotesStore, Notes} from "./notes";

type BaseStateDecoration = {
    pendingLoad: number;
}
type RootStateDecoration = BaseStateDecoration & {};
export type BranchStateDecoration = BaseStateDecoration & {
    encoding: MusenetEncoding,
    notes: Notes,
    track: Track
};

type BaseStoreDecoration = {
    addChild: (trackStore: TrackStore) => void;
    updatePendingLoad: (updater: (current: number) => number) => void;
}
type RootStoreDecoration = BaseStoreDecoration & {}
type BranchStoreDecoration = BaseStoreDecoration & {}

type PendingLoadStore = Writable<{ pendingLoad: number }>;

export type TreeStore = StoreSafeDecorated_DecoratedState_Root<RootStateDecoration, BranchStateDecoration, RootStoreDecoration, BranchStoreDecoration>;
export type BranchStore = StoreSafeDecorated_DecoratedState_Branch<RootStateDecoration, BranchStateDecoration, RootStoreDecoration, BranchStoreDecoration>;
export type BranchState = StateFor<BranchStore>;
export type NodeStore = TreeStore | BranchStore
export type NodeState = StateFor<NodeStore>;

const rootStateDecorationStore: Writable<RootStateDecoration> = writable({
    pendingLoad: 0
});
export const root: TreeStore = createTree(rootStateDecorationStore, createRootStoreDecorationSupplier(rootStateDecorationStore));

function deriveBranchStateDecorationStore(parentStore: Parameters<typeof createEncodingStore>[0] & Parameters<typeof createNotesStore>[0], trackStore: TrackStore, pendingLoadStore: PendingLoadStore): Readable<BranchStateDecoration> {
    const encodingStore = createEncodingStore(parentStore, trackStore);
    const notesStore = createNotesStore(parentStore, trackStore);
    return derived([trackStore, encodingStore, notesStore, pendingLoadStore],
        ([$trackStore, $encodingStore, $notesStore, $pendingLoadStore]) => ({
            ...$trackStore,
            ...$encodingStore,
            ...$notesStore,
            ...$pendingLoadStore
        })
    );
}

function createRootStoreDecorationSupplier(pendingLoadStore: PendingLoadStore): StoreDecorationSupplier_Root<RootStateDecoration, BranchStateDecoration, RootStoreDecoration, BranchStoreDecoration> {
    return (partDecoratedStore: StoreSafePartDecorated_DecoratedState_Root<RootStateDecoration, BranchStateDecoration, RootStoreDecoration, BranchStoreDecoration>) => ({
        addChild: (trackStore: TrackStore) => {
            const pendingLoadStore: PendingLoadStore = writable({pendingLoad: 0});
            partDecoratedStore.addChild(deriveBranchStateDecorationStore(partDecoratedStore, trackStore, pendingLoadStore), createBranchStoreDecorationSupplier(pendingLoadStore))
        },
        updatePendingLoad: (updater: (current: number) => number) => {
            pendingLoadStore.update(state => ({
                ...state,
                pendingLoad: updater(state.pendingLoad)
            }))
        }
    });
}

function createBranchStoreDecorationSupplier(pendingLoadStore: PendingLoadStore): StoreDecorationSupplier_Branch<RootStateDecoration, BranchStateDecoration, RootStoreDecoration, BranchStoreDecoration> {
    return (partDecoratedStore: StoreSafePartDecorated_DecoratedState_Branch<RootStateDecoration, BranchStateDecoration, RootStoreDecoration, BranchStoreDecoration>) => ({
        addChild: (trackStore: TrackStore) => {
            const pendingLoadStore: PendingLoadStore = writable({pendingLoad: 0});
            partDecoratedStore.addChild(deriveBranchStateDecorationStore(partDecoratedStore, trackStore, pendingLoadStore), createBranchStoreDecorationSupplier(pendingLoadStore))
        },
        updatePendingLoad: (updater: (current: number) => number) => {
            pendingLoadStore.update(state => ({
                ...state,
                pendingLoad: updater(state.pendingLoad)
            }))
        }
    })
}

const selectedBranchStore: Readable<BranchState | null> = unwrapStore<BranchState, BranchStore>(root.selectedStore_2);

type CurrentNotes = { notes: Notes, duration: number } | null;
let lastNotes: CurrentNotes = null;
export const currentNotesStore: Readable<CurrentNotes> = derived(selectedBranchStore, ($selected: BranchState | null, set: (value: CurrentNotes) => void) => {
    if (lastNotes !== null && $selected === null) {
        lastNotes = null;
        set(null);
    }
    if (lastNotes === null && $selected !== null) {
        const newValue = {
            notes: $selected.notes,
            duration: $selected.track.endsAt
        };
        lastNotes = newValue;
        set(newValue);
    }
    if (lastNotes !== null && $selected !== null) {
        if(lastNotes.duration !== $selected.track.endsAt) {
            const newValue = {
                notes: $selected.notes,
                duration: $selected.track.endsAt
            };
            lastNotes = newValue;
            set(newValue);
        }
        if(lastNotes.notes !== $selected.notes) {
            const newValue = {
                notes: $selected.notes,
                duration: $selected.track.endsAt
            };
            lastNotes = newValue;
            set(newValue);
        }
    }
}, null);
currentNotesStore.subscribe(state => console.log("Notes updated", state));

