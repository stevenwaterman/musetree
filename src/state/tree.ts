import {derived, Readable, writable, Writable} from "svelte/store";

/*
   _____ _______    _______ ______   _________     _______  ______  _____
  / ____|__   __|/\|__   __|  ____| |__   __\ \   / /  __ \|  ____|/ ____|
 | (___    | |  /  \  | |  | |__       | |   \ \_/ /| |__) | |__  | (___
  \___ \   | | / /\ \ | |  |  __|      | |    \   / |  ___/|  __|  \___ \
  ____) |  | |/ ____ \| |  | |____     | |     | |  | |    | |____ ____) |
 |_____/   |_/_/    \_\_|  |______|    |_|     |_|  |_|    |______|_____/
*/

type Discriminator<TYPE extends "root" | "branch"> = {
    type: TYPE;
}
type RootType = Discriminator<"root">;
type BranchType = Discriminator<"branch">;


type State_Base<
    DISCRIMINATOR extends Discriminator<any>,
    RD, BD, RM, BM,
> = DISCRIMINATOR & {
    children: Record<number, StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM>>;
    selectedChild: number | null;
    lastSelected: number | null;
    nextChildIndex: number;
};
type State_Root<RD, BD, RM, BM> = State_Base<RootType, RD, BD, RM, BM> & {
    path: []
};
type State_Branch<RD, BD, RM, BM> = State_Base<BranchType, RD, BD, RM, BM> & {
    path: number[];
}
type State_Either<RD, BD, RM, BM> = State_Root<RD, BD, RM, BM> | State_Branch<RD, BD, RM, BM>;


type DefaultStateDecoration<RD, BD, RM, BM> = {
    selectedByParent: boolean;
    wasLastSelectedByParent: boolean;
    onSelectedPath: boolean;
};


type StateDecoration_Root<RD, BD, RM, BM> = DefaultStateDecoration<RD, BD, RM, BM> & RD;
type StateDecoration_Branch<RD, BD, RM, BM> = DefaultStateDecoration<RD, BD, RM, BM> & BD;
type StateDecoration_Either<RD, BD, RM, BM> = StateDecoration_Root<RD, BD, RM, BM> | StateDecoration_Branch<RD, BD, RM, BM>;


type DecoratedState_Root<RD, BD, RM, BM> = State_Root<RD, BD, RM, BM> & StateDecoration_Root<RD, BD, RM, BM>;
type DecoratedState_Branch<RD, BD, RM, BM> = State_Branch<RD, BD, RM, BM> & StateDecoration_Branch<RD, BD, RM, BM>;
type DecoratedState_Either<RD, BD, RM, BM> = DecoratedState_Root<RD, BD, RM, BM> | DecoratedState_Branch<RD, BD, RM, BM>;


type DefaultStoreDecoration_Base<RD, BD, RM, BM, TYPE extends "root" | "branch"> = Discriminator<TYPE> & {
    /**
     * Adds a child to the store at the next available index.
     * The child's decoration is derived from the parent's state using the provided function
     */
    addChild: (stateDecorationStore: Readable<BD>, storeDecorationSupplier: StoreDecorationSupplier_Branch<RD, BD, RM, BM>) => void;

    /**
     * Deletes the child a the given index.
     * The selected/last selected child becomes null if it is deleted
     */
    deleteChild: (childIdx: number) => void;
    selectedChildStore_2: StoreSafe_SelectedStore<RD, BD, RM, BM>
}
type DefaultStoreDecoration_Root<RD, BD, RM, BM> = DefaultStoreDecoration_Base<RD, BD, RM, BM, "root"> & {
    /**
     * Selects the node at the given path under this one
     * Returns the actual path that was selected
     */
    select: (path: number[]) => void;
    selectedStore_2: StoreSafe_SelectedStore<RD, BD, RM, BM>;
}
type DefaultStoreDecoration_Branch<RD, BD, RM, BM> = DefaultStoreDecoration_Base<RD, BD, RM, BM, "branch"> & {
    /**
     * Selects the node at the given path under this one
     * Returns the actual path that was selected
     */
    internalSelect: (path: number[]) => void;
}
type DefaultStoreDecoration_Either<RD, BD, RM, BM> = DefaultStoreDecoration_Root<RD, BD, RM, BM> | DefaultStoreDecoration_Branch<RD, BD, RM, BM>;


type StoreDecoration_Root<RD, BD, RM, BM> = DefaultStoreDecoration_Root<RD, BD, RM, BM> & RM;
type StoreDecoration_Branch<RD, BD, RM, BM> = DefaultStoreDecoration_Branch<RD, BD, RM, BM> & BM;
type StoreDecoration_Either<RD, BD, RM, BM> = StoreDecoration_Root<RD, BD, RM, BM> | StoreDecoration_Branch<RD, BD, RM, BM>;

/*
   _____ _______ ____  _____  ______   _________     _______  ______  _____
  / ____|__   __/ __ \|  __ \|  ____| |__   __\ \   / /  __ \|  ____|/ ____|
 | (___    | | | |  | | |__) | |__       | |   \ \_/ /| |__) | |__  | (___
  \___ \   | | | |  | |  _  /|  __|      | |    \   / |  ___/|  __|  \___ \
  ____) |  | | | |__| | | \ \| |____     | |     | |  | |    | |____ ____) |
 |_____/   |_|  \____/|_|  \_\______|    |_|     |_|  |_|    |______|_____/
 */
type StoreUnsafePlain_State_Root<RD, BD, RM, BM> = Writable<State_Root<RD, BD, RM, BM>>;
type StoreUnsafePlain_State_Branch<RD, BD, RM, BM> = Writable<State_Branch<RD, BD, RM, BM>>;


type StoreSafePlain_DecoratedState_Root<RD, BD, RM, BM> = Readable<DecoratedState_Root<RD, BD, RM, BM>>;
type StoreSafePlain_DecoratedState_Branch<RD, BD, RM, BM> = Readable<DecoratedState_Branch<RD, BD, RM, BM>>;
type StoreSafePlain_DecoratedState_Either<RD, BD, RM, BM> = StoreSafePlain_DecoratedState_Root<RD, BD, RM, BM> | StoreSafePlain_DecoratedState_Branch<RD, BD, RM, BM>;


export type StoreSafePartDecorated_DecoratedState_Root<RD, BD, RM, BM> = DefaultStoreDecoration_Root<RD, BD, RM, BM> & StoreSafePlain_DecoratedState_Root<RD, BD, RM, BM>;
export type StoreSafePartDecorated_DecoratedState_Branch<RD, BD, RM, BM> = DefaultStoreDecoration_Branch<RD, BD, RM, BM> & StoreSafePlain_DecoratedState_Branch<RD, BD, RM, BM>;


export type StoreSafeDecorated_DecoratedState_Root<RD, BD, RM, BM> = StoreDecoration_Root<RD, BD, RM, BM> & StoreSafePlain_DecoratedState_Root<RD, BD, RM, BM>;
export type StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM> = StoreDecoration_Branch<RD, BD, RM, BM> & StoreSafePlain_DecoratedState_Branch<RD, BD, RM, BM>;


type StoreUnsafe_SelectedStore<RD, BD, RM, BM> = Writable<null | StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM>>;
type StoreSafe_SelectedStore<RD, BD, RM, BM> = Readable<null | StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM>>;


type StoreSafe_DefaultStateDecoration<RD, BD, RM, BM> = Readable<DefaultStateDecoration<RD, BD, RM, BM>>;


export type StoreDecorationSupplier_Root<RD, BD, RM, BM> = (partDecoratedStore: StoreSafePartDecorated_DecoratedState_Root<RD, BD, RM, BM>) => RM;
export type StoreDecorationSupplier_Branch<RD, BD, RM, BM> = (partDecoratedStore: StoreSafePartDecorated_DecoratedState_Branch<RD, BD, RM, BM>) => BM;




function rootSelect<RD, BD, RM, BM>(
    unsafeMutableStore: StoreUnsafePlain_State_Root<RD, BD, RM, BM>,
    selectedStore: StoreUnsafe_SelectedStore<RD, BD, RM, BM>,
    path: number[]
): void {
    if(path.length === 0){
        unsafeMutableStore.update((state: State_Root<RD, BD, RM, BM>) => {
            selectedStore.set(null);
            return {
                ...state,
                selectedChild: null,
                lastSelected: state.selectedChild
            }
        });
        return;
    }

    unsafeMutableStore.update((state: State_Root<RD, BD, RM, BM>) => {
        const newSelectedChild = state.children[path[0]];
        if(newSelectedChild === undefined) {
            selectedStore.set(null);
            return ({
                ...state,
                selectedChild: null,
                lastSelected: state.selectedChild
            })
        }

        const pathForChild = [...path];
        pathForChild.shift();
        newSelectedChild.internalSelect(pathForChild);

        return ({
            ...state,
            selectedChild: path[0],
            lastSelected: state.selectedChild
        });
    });
}

function branchSelect<RD, BD, RM, BM>(
    unsafeMutableStore: StoreUnsafePlain_State_Branch<RD, BD, RM, BM>,
    select: () => void,
    path: number[]
): void {
    if(path.length === 0){
        unsafeMutableStore.update((state: State_Branch<RD, BD, RM, BM>) => {
            select();
            return {
                ...state,
                selectedChild: null,
                lastSelected: state.selectedChild
            }
        });
        return;
    }

    unsafeMutableStore.update((state: State_Branch<RD, BD, RM, BM>) => {
        const newSelectedChild = state.children[path[0]];
        if(newSelectedChild === undefined) {
            select();
            return ({
                ...state,
                selectedChild: null,
                lastSelected: state.selectedChild
            })
        }

        const pathForChild = [...path];
        pathForChild.shift();
        newSelectedChild.internalSelect(pathForChild);

        return ({
            ...state,
            selectedChild: path[0],
            lastSelected: state.selectedChild
        });
    });
}

function addChild<
    RD, BD, RM, BM,
    STATE extends State_Either<RD, BD, RM, BM>
>(
    internalStore: Writable<STATE>,
    decoratedStore: StoreSafePlain_DecoratedState_Either<RD, BD, RM, BM>,
    selectedStore: StoreUnsafe_SelectedStore<RD, BD, RM, BM>,
    stateDecorationStore: Readable<BD>,
    storeDecorationSupplier: StoreDecorationSupplier_Branch<RD, BD, RM, BM>
): void {
    internalStore.update((state: STATE) => {
        const childIndex = state.nextChildIndex;
        const selectionInfoStore: StoreSafe_DefaultStateDecoration<RD, BD, RM, BM> = derived(decoratedStore, ($parentTotal: DecoratedState_Either<RD, BD, RM, BM>) => ({
            selectedByParent: $parentTotal.selectedChild === childIndex,
            wasLastSelectedByParent: $parentTotal.lastSelected === childIndex,
            onSelectedPath: $parentTotal.onSelectedPath && $parentTotal.selectedChild === childIndex
        }));
        const newChild: StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM> = createBranchStore([...state.path, childIndex], stateDecorationStore, storeDecorationSupplier, selectionInfoStore, selectedStore);
        const children: Record<number, StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM>> = {...state.children};
        children[state.nextChildIndex] = newChild;
        return {
            ...state,
            children,
            nextChildIndex: childIndex + 1
        }
    })
}

function rootDeleteChild<
    RD, BD, RM, BM
    >(
    internalStore: StoreUnsafePlain_State_Root<RD, BD, RM, BM>,
    selectedStore: StoreUnsafe_SelectedStore<RD, BD, RM, BM>,
    childIdx: number
): void {
    internalStore.update((state: State_Root<RD, BD, RM, BM>) => {
        const removedChild: StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM> | undefined = state.children[childIdx];
        if(removedChild === undefined) return state;

        const newChildren = {...state.children};
        delete newChildren[childIdx];

        const newState = {
            ...state,
            children: newChildren
        };

        if(state.selectedChild === childIdx) {
            newState.selectedChild = null;
            selectedStore.set(null);
        }

        if(state.lastSelected === childIdx) {
            newState.lastSelected = null;
        }

        return newState;
    })
}

function branchDeleteChild<
    RD, BD, RM, BM
>(
    internalStore: StoreUnsafePlain_State_Branch<RD, BD, RM, BM>,
    select: () => void,
    childIdx: number
): void {
    internalStore.update((state: State_Branch<RD, BD, RM, BM>) => {
        const removedChild: StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM> | undefined = state.children[childIdx];
        if(removedChild === undefined) return state;

        const newChildren = {...state.children};
        delete newChildren[childIdx];

        const newState = {
            ...state,
            children: newChildren
        };

        if(state.selectedChild === childIdx) {
            newState.selectedChild = null;
            select();
        }

        if(state.lastSelected === childIdx) {
            newState.lastSelected = null;
        }

        return newState;
    })
}

function createRootStore<RD, BD, RM, BM>(stateDecorationStore: Readable<RD>, storeDecorationSupplier_Root: StoreDecorationSupplier_Root<RD, BD, RM, BM>): StoreSafeDecorated_DecoratedState_Root<RD, BD, RM, BM> {
    const initialState: State_Root<RD, BD, RM, BM> = {
        type: "root",
        children: {},
        nextChildIndex: 1,
        selectedChild: null,
        lastSelected: null,
        path: [],
    };
    const internalStore: StoreUnsafePlain_State_Root<RD, BD, RM, BM> = writable(initialState);
    const selectionInfoStore: StoreSafe_DefaultStateDecoration<RD, BD, RM, BM> = writable({
        selectedByParent: true,
        wasLastSelectedByParent: false,
        onSelectedPath: true
    });
    const decoratedStateStore: StoreSafePlain_DecoratedState_Root<RD, BD, RM, BM> = derived(
        [internalStore, stateDecorationStore, selectionInfoStore],
        ([$internalStore, $decorationStore, $selectionInfoStore]) => ({
        ...$internalStore,
        ...$decorationStore,
        ...$selectionInfoStore
    }));

    const mutableSelectedStore: StoreUnsafe_SelectedStore<RD, BD, RM, BM> = writable(null);

    let partDecorated: StoreSafePartDecorated_DecoratedState_Root<RD, BD, RM, BM>;
    partDecorated = {
        type: "root" as const,
        ...decoratedStateStore,
        addChild: (stateDecorationStore: Readable<BD>, storeDecorationSupplier: StoreDecorationSupplier_Branch<RD, BD, RM, BM>) => addChild(internalStore, decoratedStateStore, mutableSelectedStore, stateDecorationStore, storeDecorationSupplier),
        select: (path: number[]) => rootSelect(internalStore, mutableSelectedStore, path),
        deleteChild: (childIdx: number) => rootDeleteChild(internalStore, mutableSelectedStore, childIdx),
        selectedStore_2: mutableSelectedStore,
        selectedChildStore_2: deriveSelectedChildStore(decoratedStateStore)
    };

    return {
        ...partDecorated,
        ...storeDecorationSupplier_Root(partDecorated)
    }
}

function createBranchStore<RD, BD, RM, BM>(path: number[], decorationStore: Readable<BD>, storeDecorationSupplier: StoreDecorationSupplier_Branch<RD, BD, RM, BM>, selectionInfoStore: StoreSafe_DefaultStateDecoration<RD, BD, RM, BM>, selectedStore: StoreUnsafe_SelectedStore<RD, BD, RM, BM>): StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM> {
    const initialState: State_Branch<RD, BD, RM, BM> = {
        type: "branch",
        nextChildIndex: 1,
        children: {},
        selectedChild: null,
        lastSelected: null,
        path
    };
    const internalStore: StoreUnsafePlain_State_Branch<RD, BD, RM, BM> = writable(initialState);

    const decoratedStore: StoreSafePlain_DecoratedState_Branch<RD, BD, RM, BM> = derived(
        [internalStore, decorationStore, selectionInfoStore],
        ([$internalStore, $decorationStore, $selectionInfoStore]) => ({
            ...$internalStore,
            ...$decorationStore,
            ...$selectionInfoStore
    }));

    let partDecorated: StoreSafePartDecorated_DecoratedState_Branch<RD, BD, RM, BM>;
    let fullyDecorated: StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM>;
    const select = () => {selectedStore.set(fullyDecorated)};
    partDecorated = {
        type: "branch" as const,
        ...decoratedStore,
        selectedChildStore_2: deriveSelectedChildStore(decoratedStore),
        internalSelect: (path: number[]) => branchSelect(internalStore, select, path),
        addChild: (stateDecorationStore: Readable<BD>, storeDecorationSupplier: StoreDecorationSupplier_Branch<RD, BD, RM, BM>) => addChild(internalStore, decoratedStore, selectedStore, stateDecorationStore, storeDecorationSupplier),
        deleteChild: (childIdx: number) => branchDeleteChild(internalStore, select, childIdx)
    };
    fullyDecorated = {
        ...partDecorated,
        ...storeDecorationSupplier(partDecorated)
    };
    return fullyDecorated;
}

function deriveSelectedChildStore<RD, BD, RM, BM>(parentStore: StoreSafePlain_DecoratedState_Either<RD, BD, RM, BM>): StoreSafe_SelectedStore<RD, BD, RM, BM> {
    return derived(parentStore, $parentStore => {
        let idx = $parentStore.selectedChild;
        if(idx === null) return null;

        const selected: StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM> | undefined = $parentStore.children[idx];
        return selected === undefined ? null : selected;
    });
}

export const createTree = createRootStore;