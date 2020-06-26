import {derived, Readable, Writable, writable} from "svelte/store";
import {createEncodingStore, MusenetEncoding} from "./encoding";
import {deriveBranchSectionsStore, deriveRootSectionsStore, Section, SectionStore} from "./section";
import {arrayEqual, arrayEqualNullable, maybeDerived, unwrapStore} from "../utils";
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
import {request} from "../broker";
import {autoRequestStore, Config, configStore} from "./settings";
import {undoStore} from "./undo";
import {deriveSerialisedBranchStore, deriveSerialisedRootStore} from "./serialisation";
import {derivePlacementStore} from "./placement";

type BaseStateDecoration = {
    pendingLoad: number;
}
type RootStateDecoration = BaseStateDecoration & {};
export type BranchStateDecoration = BaseStateDecoration & {
    encoding: MusenetEncoding,
    section: Section
};

type BaseStoreDecoration = {
    addChild: (sectionStore: SectionStore) => Promise<BranchStore>;
    deleteChildWithUndo: (childIndex: number) => Promise<BranchStore | null>;
    updatePendingLoad: (updater: (current: number) => number) => void;
    serialisedStore: Readable<string>;
    selectedSectionsStore: Readable<Section[]>;
    placementStore: Readable<Array<[number, number]>>;
}
type RootStoreDecoration = BaseStoreDecoration & {
}
type BranchStoreDecoration = BaseStoreDecoration & {
}

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
export function createTrackTree(): TreeStore {
    return createTree(rootStateDecorationStore, createRootStoreDecorationSupplier(rootStateDecorationStore));
}
export const root: TreeStore = createTrackTree();

function deriveBranchStateDecorationStore(parentStore: Parameters<typeof createEncodingStore>[0], sectionStore: SectionStore, pendingLoadStore: PendingLoadStore): Readable<BranchStateDecoration> {
    const encodingStore = createEncodingStore(parentStore, sectionStore);
    return derived([sectionStore, encodingStore, pendingLoadStore],
        ([$sectionStore, $encodingStore, $pendingLoadStore]) => ({
            ...$sectionStore,
            ...$encodingStore,
            ...$pendingLoadStore
        })
    );
}

function createRootStoreDecorationSupplier(pendingLoadStore: PendingLoadStore): StoreDecorationSupplier_Root<RootStateDecoration, BranchStateDecoration, RootStoreDecoration, BranchStoreDecoration> {
    return (partDecoratedStore: StoreSafePartDecorated_DecoratedState_Root<RootStateDecoration, BranchStateDecoration, RootStoreDecoration, BranchStoreDecoration>) => ({
        addChild: async (sectionStore: SectionStore) => {
            const pendingLoadStore: PendingLoadStore = writable({pendingLoad: 0});
            return await partDecoratedStore.addChild(deriveBranchStateDecorationStore(partDecoratedStore, sectionStore, pendingLoadStore), createBranchStoreDecorationSupplier(pendingLoadStore))
        },
        deleteChildWithUndo: async (childIndex: number) => {
            const removedChild: BranchStore | null = await partDecoratedStore.hideChild(childIndex);
            if(removedChild === null) return null;
            undoStore.onDelete(partDecoratedStore, childIndex);
            return removedChild;
        },
        updatePendingLoad: (updater: (current: number) => number) => {
            pendingLoadStore.update(state => ({
                ...state,
                pendingLoad: updater(state.pendingLoad)
            }))
        },
        serialisedStore: deriveSerialisedRootStore(partDecoratedStore),
        selectedSectionsStore: deriveRootSectionsStore(partDecoratedStore),
        placementStore: derivePlacementStore(partDecoratedStore)
    });
}

function createBranchStoreDecorationSupplier(pendingLoadStore: PendingLoadStore): StoreDecorationSupplier_Branch<RootStateDecoration, BranchStateDecoration, RootStoreDecoration, BranchStoreDecoration> {
    return (partDecoratedStore: StoreSafePartDecorated_DecoratedState_Branch<RootStateDecoration, BranchStateDecoration, RootStoreDecoration, BranchStoreDecoration>) => ({
        addChild: async (sectionStore: SectionStore) => {
            const pendingLoadStore: PendingLoadStore = writable({pendingLoad: 0});
            return await partDecoratedStore.addChild(deriveBranchStateDecorationStore(partDecoratedStore, sectionStore, pendingLoadStore), createBranchStoreDecorationSupplier(pendingLoadStore))
        },
        deleteChildWithUndo: async (childIndex: number) => {
            const removedChild: BranchStore | null = await partDecoratedStore.hideChild(childIndex);
            if(removedChild === null) return null;
            undoStore.onDelete(partDecoratedStore, childIndex);
            return removedChild;
        },
        updatePendingLoad: (updater: (current: number) => number) => {
            pendingLoadStore.update(state => ({
                ...state,
                pendingLoad: updater(state.pendingLoad)
            }))
        },
        serialisedStore: deriveSerialisedBranchStore(partDecoratedStore),
        selectedSectionsStore: deriveBranchSectionsStore(partDecoratedStore),
        placementStore: derivePlacementStore(partDecoratedStore)
    })
}

export const selectedBranchStore: Readable<BranchState | null> = unwrapStore<BranchState, BranchStore>(root.selectedStore_2, (a,b) => arrayEqual(a.path, b.path));
export const selectedEncodingStore: Readable<number[] | null> = maybeDerived(selectedBranchStore, state => state === null ? null : state.encoding, null, (a,b) => arrayEqualNullable(a, b));

let autoRequest: boolean = null as any;
autoRequestStore.subscribe(value => {autoRequest = value});

let config: Config = null as any;
configStore.subscribe(value => {config = value});

const selectedStoreAndState: Readable<null | [BranchStore, BranchState]> = derived([root.selectedStore_2, selectedBranchStore], ([storeValue, stateValue]) => {
    if(storeValue === null || stateValue === null) return null;
    return [storeValue, stateValue];
})

selectedStoreAndState.subscribe(async pair => {
    if(pair === null || !autoRequest) return;
    const [store, state] = pair;
    if(Object.keys(state.children).length || state.pendingLoad) return;
    await request(config, store, state);
})

root.serialisedStore.subscribe((serialised: string) => {
    if(serialised !== `{"children":[]}`){
        localStorage.setItem("autosave", serialised);
    }
})

export function toReadableNodeState(nodeStore: NodeStore): Readable<NodeState> {
    return derived(nodeStore, (nodeState) => nodeState)
}