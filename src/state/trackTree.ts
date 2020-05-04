import {derived, Readable, Writable, writable} from "svelte/store";
import {createEncodingStore, MusenetEncoding} from "./encoding";
import {Section, SectionStore} from "./section";
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
import {request} from "../broker";
import {autoRequestStore, Config, configStore} from "./settings";
import {get_store_value} from "svelte/internal";

type BaseStateDecoration = {
    pendingLoad: number;
}
type RootStateDecoration = BaseStateDecoration & {};
export type BranchStateDecoration = BaseStateDecoration & {
    encoding: MusenetEncoding,
    notes: Notes,
    section: Section
};

type BaseStoreDecoration = {
    addChild: (sectionStore: SectionStore) => void;
    updatePendingLoad: (updater: (current: number) => number) => void;
}
type RootStoreDecoration = BaseStoreDecoration & {}
type BranchStoreDecoration = BaseStoreDecoration & {}

type PendingLoadStore = Writable<{ pendingLoad: number }>;

export type TreeStore = StoreSafeDecorated_DecoratedState_Root<RootStateDecoration, BranchStateDecoration, RootStoreDecoration, BranchStoreDecoration>;
export type TreeState = StateFor<TreeStore>;
export type BranchStore = StoreSafeDecorated_DecoratedState_Branch<RootStateDecoration, BranchStateDecoration, RootStoreDecoration, BranchStoreDecoration>;
export type BranchState = StateFor<BranchStore>;
export type NodeStore = TreeStore | BranchStore
export type NodeState = StateFor<NodeStore>;

const rootStateDecorationStore: Writable<RootStateDecoration> = writable({
    pendingLoad: 0
});
export const root: TreeStore = createTree(rootStateDecorationStore, createRootStoreDecorationSupplier(rootStateDecorationStore));

function deriveBranchStateDecorationStore(parentStore: Parameters<typeof createEncodingStore>[0] & Parameters<typeof createNotesStore>[0], sectionStore: SectionStore, pendingLoadStore: PendingLoadStore): Readable<BranchStateDecoration> {
    const encodingStore = createEncodingStore(parentStore, sectionStore);
    const notesStore = createNotesStore(parentStore, sectionStore);
    return derived([sectionStore, encodingStore, notesStore, pendingLoadStore],
        ([$sectionStore, $encodingStore, $notesStore, $pendingLoadStore]) => ({
            ...$sectionStore,
            ...$encodingStore,
            ...$notesStore,
            ...$pendingLoadStore
        })
    );
}

function createRootStoreDecorationSupplier(pendingLoadStore: PendingLoadStore): StoreDecorationSupplier_Root<RootStateDecoration, BranchStateDecoration, RootStoreDecoration, BranchStoreDecoration> {
    return (partDecoratedStore: StoreSafePartDecorated_DecoratedState_Root<RootStateDecoration, BranchStateDecoration, RootStoreDecoration, BranchStoreDecoration>) => ({
        addChild: (sectionStore: SectionStore) => {
            const pendingLoadStore: PendingLoadStore = writable({pendingLoad: 0});
            partDecoratedStore.addChild(deriveBranchStateDecorationStore(partDecoratedStore, sectionStore, pendingLoadStore), createBranchStoreDecorationSupplier(pendingLoadStore))
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
        addChild: (sectionStore: SectionStore) => {
            const pendingLoadStore: PendingLoadStore = writable({pendingLoad: 0});
            partDecoratedStore.addChild(deriveBranchStateDecorationStore(partDecoratedStore, sectionStore, pendingLoadStore), createBranchStoreDecorationSupplier(pendingLoadStore))
        },
        updatePendingLoad: (updater: (current: number) => number) => {
            pendingLoadStore.update(state => ({
                ...state,
                pendingLoad: updater(state.pendingLoad)
            }))
        }
    })
}

export const selectedBranchStore: Readable<BranchState | null> = unwrapStore<BranchState, BranchStore>(root.selectedStore_2, (a,b) => arraysEqual(a.path, b.path));
export const selectedPathStore: Readable<number[] | null> = derived(selectedBranchStore, state => state === null ? null : state.path);

function arraysEqual(a: any[], b: any[]) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;

    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

let autoRequest: boolean = null as any;
autoRequestStore.subscribe(value => {autoRequest = value});

let config: Config = null as any;
configStore.subscribe(value => {config = value});

selectedBranchStore.subscribe(async state => {
    if(state === null || !autoRequest) return;
    if(Object.keys(state.children).length || state.pendingLoad) return;

    const store = get_store_value(root.selectedStore_2);
    await request(config, store, state);
})
