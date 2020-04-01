import {derived, Readable, writable, Writable} from "svelte/store";

type NodeType<TYPE extends "root" | "branch"> = {
    type: TYPE;
}
type RootType = NodeType<"root">;
type BranchType = NodeType<"branch">;

type BaseState<
    TYPE extends NodeType<any>,
    ROOT_DECORATION,
    BRANCH_DECORATION,
> = TYPE & {
    children: Record<number, MutableDecoratedBranchStore<ROOT_DECORATION, BRANCH_DECORATION>>;
    selectedChild: number | null;
    lastSelected: number | null;
    nextChildIndex: number;
};
type PlainRootState<ROOT_DECORATION, BRANCH_DECORATION> = BaseState<RootType, ROOT_DECORATION, BRANCH_DECORATION> & {
    path: []
};
type PlainBranchState<ROOT_DECORATION, BRANCH_DECORATION> = BaseState<BranchType, ROOT_DECORATION, BRANCH_DECORATION> & {
    path: number[];
}
type PlainState<ROOT_DECORATION, BRANCH_DECORATION> = PlainRootState<ROOT_DECORATION, BRANCH_DECORATION> | PlainBranchState<ROOT_DECORATION, BRANCH_DECORATION>;

type SelectionInfo = {
    selectedByParent: boolean;
    onSelectedPath: boolean;
};
type SelectionInfoStore = Readable<SelectionInfo>;
type DecoratedRootState<ROOT_DECORATION, BRANCH_DECORATION> = ROOT_DECORATION & PlainRootState<ROOT_DECORATION, BRANCH_DECORATION> & SelectionInfo;
type DecoratedBranchState<ROOT_DECORATION, BRANCH_DECORATION> = BRANCH_DECORATION & PlainBranchState<ROOT_DECORATION, BRANCH_DECORATION> & SelectionInfo;
type DecoratedState<ROOT_DECORATION, BRANCH_DECORATION> = DecoratedRootState<ROOT_DECORATION, BRANCH_DECORATION> | DecoratedBranchState<ROOT_DECORATION, BRANCH_DECORATION>;

type Mutator<BRANCH_DECORATION> = {
    /**
     * Adds a child to the store at the next available index.
     * The child's decoration is derived from the parent's state using the provided function
     */
    addChild: (decorationStore: Readable<BRANCH_DECORATION>) => void;

    /**
     * Deletes the child a the given index.
     * The selected/last selected child becomes null if it is deleted
     */
    deleteChild: (childIdx: number) => void;

    /**
     * Selects the node at the given path under this one
     * Returns the actual path that was selected
     */
    select: (path: number[]) => void;
};

type MutablePlainRootStore<ROOT_DECORATION, BRANCH_DECORATION> = Writable<PlainRootState<ROOT_DECORATION, BRANCH_DECORATION>>;
type MutablePlainBranchStore<ROOT_DECORATION, BRANCH_DECORATION> = Writable<PlainBranchState<ROOT_DECORATION, BRANCH_DECORATION>>;
type MutablePlainStore<ROOT_DECORATION, BRANCH_DECORATION> = MutablePlainRootStore<ROOT_DECORATION, BRANCH_DECORATION> | MutablePlainBranchStore<ROOT_DECORATION, BRANCH_DECORATION>;

type ImmutableDecoratedRootStore<ROOT_DECORATION, BRANCH_DECORATION> = Readable<DecoratedRootState<ROOT_DECORATION, BRANCH_DECORATION>>;
type ImmutableDecoratedBranchStore<ROOT_DECORATION, BRANCH_DECORATION> = Readable<DecoratedBranchState<ROOT_DECORATION, BRANCH_DECORATION>>;
type ImmutableDecoratedStore<ROOT_DECORATION, BRANCH_DECORATION> = ImmutableDecoratedRootStore<ROOT_DECORATION, BRANCH_DECORATION> | ImmutableDecoratedBranchStore<ROOT_DECORATION, BRANCH_DECORATION>;

export type MutableDecoratedRootStore<ROOT_DECORATION, BRANCH_DECORATION> = RootType & Mutator<BRANCH_DECORATION> & ImmutableDecoratedRootStore<ROOT_DECORATION, BRANCH_DECORATION> & {
    selectedStore: SelectedStore<ROOT_DECORATION, BRANCH_DECORATION>;
};
export type MutableDecoratedBranchStore<ROOT_DECORATION, BRANCH_DECORATION> = BranchType & Mutator<BRANCH_DECORATION> & ImmutableDecoratedBranchStore<ROOT_DECORATION, BRANCH_DECORATION>;
export type MutableDecoratedStore<ROOT_DECORATION, BRANCH_DECORATION> = MutableDecoratedRootStore<ROOT_DECORATION, BRANCH_DECORATION> | MutableDecoratedBranchStore<ROOT_DECORATION, BRANCH_DECORATION>;

type MutableSelectedStore<ROOT_DECORATION, BRANCH_DECORATION> = Writable<ImmutableDecoratedBranchStore<ROOT_DECORATION, BRANCH_DECORATION> | null>;
type SelectedStore<ROOT_DECORATION, BRANCH_DECORATION> = Readable<DecoratedBranchState<ROOT_DECORATION, BRANCH_DECORATION> | null>;







function rootSelect<
    ROOT_DECORATION,
    BRANCH_DECORATION,
    >(
    internalStore: MutablePlainRootStore<ROOT_DECORATION, BRANCH_DECORATION>,
    selectedStore: MutableSelectedStore<ROOT_DECORATION, BRANCH_DECORATION>,
    path: number[]
): void {
    if(path.length === 0){
        internalStore.update((state: PlainRootState<ROOT_DECORATION, BRANCH_DECORATION>) => {
            return {
                ...state,
                selectedChild: null,
                lastSelected: state.selectedChild
            }
        });
        return;
    }

    internalStore.update((state: PlainRootState<ROOT_DECORATION, BRANCH_DECORATION>) => {
        const newSelectedChild = state.children[path[0]];
        if(newSelectedChild === undefined) {
            return ({
                ...state,
                selectedChild: null,
                lastSelected: state.selectedChild
            })
        }

        const pathForChild = [...path];
        pathForChild.shift();
        newSelectedChild.select(pathForChild);

        return ({
            ...state,
            selectedChild: path[0],
            lastSelected: state.selectedChild
        });

    });
}

function branchSelect<
    ROOT_DECORATION,
    BRANCH_DECORATION,
>(
    internalStore: MutablePlainBranchStore<ROOT_DECORATION, BRANCH_DECORATION>,
    decoratedStore: ImmutableDecoratedBranchStore<ROOT_DECORATION, BRANCH_DECORATION>,
    selectedStore: MutableSelectedStore<ROOT_DECORATION, BRANCH_DECORATION>,
    path: number[]
): void {
    if(path.length === 0){
        internalStore.update((state: PlainBranchState<ROOT_DECORATION, BRANCH_DECORATION>) => {
            selectedStore.set(decoratedStore);
            return {
                ...state,
                selectedChild: null,
                lastSelected: state.selectedChild
            }
        });
        return;
    }

    internalStore.update((state: PlainBranchState<ROOT_DECORATION, BRANCH_DECORATION>) => {
        const newSelectedChild = state.children[path[0]];
        if(newSelectedChild === undefined) {
            selectedStore.set(decoratedStore);
            return ({
                ...state,
                selectedChild: null,
                lastSelected: state.selectedChild
            })
        }

        const pathForChild = [...path];
        pathForChild.shift();
        newSelectedChild.select(pathForChild);

        return ({
            ...state,
            selectedChild: path[0],
            lastSelected: state.selectedChild
        });

    });
}

function addChild<
    ROOT_DECORATION,
    BRANCH_DECORATION,
    STATE extends PlainState<ROOT_DECORATION, BRANCH_DECORATION>
>(
    internalStore: Writable<STATE>,
    decoratedStore: ImmutableDecoratedStore<ROOT_DECORATION, BRANCH_DECORATION>,
    selectedStore: MutableSelectedStore<ROOT_DECORATION, BRANCH_DECORATION>,
    decorationStore: Readable<BRANCH_DECORATION>
): void {
    internalStore.update((state: STATE) => {
        const childIndex = state.nextChildIndex;
        const selectionInfoStore: SelectionInfoStore = derived([decoratedStore], ([$parentTotal]) => ({
            selectedByParent: $parentTotal.selectedChild === childIndex,
            onSelectedPath: $parentTotal.onSelectedPath && $parentTotal.selectedChild === childIndex
        }));
        const newChild: MutableDecoratedBranchStore<ROOT_DECORATION, BRANCH_DECORATION> = createBranchStore([...state.path, childIndex], decorationStore, selectionInfoStore, selectedStore);
        const children: Record<number, MutableDecoratedBranchStore<ROOT_DECORATION, BRANCH_DECORATION>> = {...state.children};
        children[state.nextChildIndex] = newChild;
        return {
            ...state,
            children,
            nextChildIndex: childIndex + 1
        }
    })
}

function rootDeleteChild<
    ROOT_DECORATION,
    BRANCH_DECORATION,
    >(
    internalStore: MutablePlainRootStore<ROOT_DECORATION, BRANCH_DECORATION>,
    selectedStore: MutableSelectedStore<ROOT_DECORATION, BRANCH_DECORATION>,
    childIdx: number
): void {
    internalStore.update((state: PlainRootState<ROOT_DECORATION, BRANCH_DECORATION>) => {
        const removedChild: MutableDecoratedBranchStore<ROOT_DECORATION, BRANCH_DECORATION> | undefined = state.children[childIdx];
        if(removedChild === undefined) return state;

        const newChildren = {...state.children};
        delete(newChildren[childIdx]);

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
    ROOT_DECORATION,
    BRANCH_DECORATION,
>(
    internalStore: MutablePlainBranchStore<ROOT_DECORATION, BRANCH_DECORATION>,
    decoratedStore: ImmutableDecoratedBranchStore<ROOT_DECORATION, BRANCH_DECORATION>,
    selectedStore: MutableSelectedStore<ROOT_DECORATION, BRANCH_DECORATION>,
    childIdx: number
): void {
    internalStore.update((state: PlainBranchState<ROOT_DECORATION, BRANCH_DECORATION>) => {
        const removedChild: MutableDecoratedBranchStore<ROOT_DECORATION, BRANCH_DECORATION> | undefined = state.children[childIdx];
        if(removedChild === undefined) return state;

        const newChildren = {...state.children};
        delete(newChildren[childIdx]);

        const newState = {
            ...state,
            children: newChildren
        };

        if(state.selectedChild === childIdx) {
            newState.selectedChild = null;
            selectedStore.set(decoratedStore);
        }

        if(state.lastSelected === childIdx) {
            newState.lastSelected = null;
        }

        return newState;
    })
}

function createRootStore<ROOT_DECORATION, BRANCH_DECORATION>(decorationStore: Readable<ROOT_DECORATION>): MutableDecoratedRootStore<ROOT_DECORATION, BRANCH_DECORATION> {
    const initialState: PlainRootState<ROOT_DECORATION, BRANCH_DECORATION> = {
        type: "root",
        children: {},
        nextChildIndex: 1,
        selectedChild: null,
        lastSelected: null,
        path: [],
    };
    const internalStore: MutablePlainRootStore<ROOT_DECORATION, BRANCH_DECORATION> = writable(initialState);
    const selectionInfoStore: SelectionInfoStore = writable({
        selectedByParent: true,
        onSelectedPath: true
    });
    const decoratedStore: ImmutableDecoratedRootStore<ROOT_DECORATION, BRANCH_DECORATION> = derived(
        [internalStore, decorationStore, selectionInfoStore],
        ([$internalStore, $decorationStore, $selectionInfoStore]) => ({
        ...$internalStore,
        ...$decorationStore,
        ...$selectionInfoStore
    }));

    const mutableSelectedStore: MutableSelectedStore<ROOT_DECORATION, BRANCH_DECORATION> = writable(null);
    const selectedStore: Writable<DecoratedBranchState<ROOT_DECORATION, BRANCH_DECORATION> | null> = writable(null);
    let unsub: () => void = () => {};
    mutableSelectedStore.subscribe((nestedStore: ImmutableDecoratedBranchStore<ROOT_DECORATION, BRANCH_DECORATION> | null) => {
        unsub();
        if(nestedStore === null){
            unsub = () => {};
            selectedStore.set(null);
        } else {
            unsub = nestedStore.subscribe((state: DecoratedBranchState<ROOT_DECORATION, BRANCH_DECORATION>) => {
                selectedStore.set(state)
            })
        }
    });

    return {
        type: "root",
        ...decoratedStore,
        addChild: (decorationStore: Readable<BRANCH_DECORATION>) => addChild(internalStore, decoratedStore, mutableSelectedStore, decorationStore),
        select: (path: number[]) => rootSelect(internalStore, mutableSelectedStore, path),
        deleteChild: (childIdx: number) => rootDeleteChild(internalStore, mutableSelectedStore, childIdx),
        selectedStore: selectedStore
    }
}

function createBranchStore<ROOT_DECORATION, BRANCH_DECORATION>(path: number[], decorationStore: Readable<BRANCH_DECORATION>, selectionInfoStore: SelectionInfoStore, selectedStore: MutableSelectedStore<ROOT_DECORATION, BRANCH_DECORATION>): MutableDecoratedBranchStore<ROOT_DECORATION, BRANCH_DECORATION> {
    const initialState: PlainBranchState<ROOT_DECORATION, BRANCH_DECORATION> = {
        type: "branch",
        nextChildIndex: 1,
        children: {},
        selectedChild: null,
        lastSelected: null,
        path
    };
    const internalStore: MutablePlainBranchStore<ROOT_DECORATION, BRANCH_DECORATION> = writable(initialState);

    const decoratedStore: ImmutableDecoratedBranchStore<ROOT_DECORATION, BRANCH_DECORATION> = derived(
        [internalStore, decorationStore, selectionInfoStore],
        ([$internalStore, $decorationStore, $selectionInfoStore]) => ({
            ...$internalStore,
            ...$decorationStore,
            ...$selectionInfoStore
    }));
    return {
        type: "branch",
        ...decoratedStore,
        addChild: (decorationStore: Readable<BRANCH_DECORATION>) => addChild(internalStore, decoratedStore, selectedStore, decorationStore),
        select: (path: number[]) => branchSelect(internalStore, decoratedStore, selectedStore, path),
        deleteChild: (childIdx: number) => branchDeleteChild(internalStore, decoratedStore, selectedStore, childIdx)
    }
}

export const createTree = createRootStore;