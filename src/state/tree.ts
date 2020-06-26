import { derived, Readable, writable, Writable } from "svelte/store";
import { maybeDerived, unwrapStoreNonNull } from "../utils";

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


type State_Base<DISCRIMINATOR extends Discriminator<any>,
  RD, BD, RM, BM,
  > = DISCRIMINATOR & {
    children: Record<number, StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM>>;
    hiddenChildren: Record<number, StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM>>;
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
type StateDecoration_Either<RD, BD, RM, BM> =
  StateDecoration_Root<RD, BD, RM, BM>
  | StateDecoration_Branch<RD, BD, RM, BM>;


type DecoratedState_Root<RD, BD, RM, BM> = State_Root<RD, BD, RM, BM> & StateDecoration_Root<RD, BD, RM, BM>;
type DecoratedState_Branch<RD, BD, RM, BM> = State_Branch<RD, BD, RM, BM> & StateDecoration_Branch<RD, BD, RM, BM>;
type DecoratedState_Either<RD, BD, RM, BM> =
  DecoratedState_Root<RD, BD, RM, BM>
  | DecoratedState_Branch<RD, BD, RM, BM>;


type DefaultStoreDecoration_Base<RD, BD, RM, BM, TYPE extends "root" | "branch"> = Discriminator<TYPE> & {
  /**
   * Adds a child to the store at the next available index.
   * The child's decoration is derived from the parent's state using the provided function
   */
  addChild: (stateDecorationStore: Readable<BD>, storeDecorationSupplier: StoreDecorationSupplier_Branch<RD, BD, RM, BM>) => Promise<StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM>>;

  /**
   * Deletes the child a the given index.
   * The selected/last selected child becomes null if it is deleted
   */
  deleteChild: (childIdx: number) => Promise<StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM> | null>;

  hideChild: (childIdx: number) => Promise<StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM> | null>;
  showChild: (childIdx: number) => Promise<StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM> | null>;

  selectedChildStore_2: StoreSafe_SelectedStore<RD, BD, RM, BM>;
  numberOfLeavesStore: Readable<number>;
  resetNextChildIndex: () => void;
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
type DefaultStoreDecoration_Either<RD, BD, RM, BM> =
  DefaultStoreDecoration_Root<RD, BD, RM, BM>
  | DefaultStoreDecoration_Branch<RD, BD, RM, BM>;


type StoreDecoration_Root<RD, BD, RM, BM> = DefaultStoreDecoration_Root<RD, BD, RM, BM> & RM;
type StoreDecoration_Branch<RD, BD, RM, BM> = DefaultStoreDecoration_Branch<RD, BD, RM, BM> & BM;
type StoreDecoration_Either<RD, BD, RM, BM> =
  StoreDecoration_Root<RD, BD, RM, BM>
  | StoreDecoration_Branch<RD, BD, RM, BM>;

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
type StoreUnsafePlain_State_Either<RD, BD, RM, BM> =
  StoreUnsafePlain_State_Branch<RD, BD, RM, BM>
  | StoreUnsafePlain_State_Root<RD, BD, RM, BM>;


type StoreSafePlain_DecoratedState_Root<RD, BD, RM, BM> = Readable<DecoratedState_Root<RD, BD, RM, BM>>;
type StoreSafePlain_DecoratedState_Branch<RD, BD, RM, BM> = Readable<DecoratedState_Branch<RD, BD, RM, BM>>;
type StoreSafePlain_DecoratedState_Either<RD, BD, RM, BM> =
  StoreSafePlain_DecoratedState_Root<RD, BD, RM, BM>
  | StoreSafePlain_DecoratedState_Branch<RD, BD, RM, BM>;


export type StoreSafePartDecorated_DecoratedState_Root<RD, BD, RM, BM> =
  DefaultStoreDecoration_Root<RD, BD, RM, BM>
  & StoreSafePlain_DecoratedState_Root<RD, BD, RM, BM>;
export type StoreSafePartDecorated_DecoratedState_Branch<RD, BD, RM, BM> =
  DefaultStoreDecoration_Branch<RD, BD, RM, BM>
  & StoreSafePlain_DecoratedState_Branch<RD, BD, RM, BM>;


export type StoreSafeDecorated_DecoratedState_Root<RD, BD, RM, BM> =
  StoreDecoration_Root<RD, BD, RM, BM>
  & StoreSafePlain_DecoratedState_Root<RD, BD, RM, BM>;
export type StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM> =
  StoreDecoration_Branch<RD, BD, RM, BM>
  & StoreSafePlain_DecoratedState_Branch<RD, BD, RM, BM>;


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
  if (path.length === 0) {
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
    if (newSelectedChild === undefined) {
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
  if (path.length === 0) {
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
    if (newSelectedChild === undefined) {
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

async function addChild<RD, BD, RM, BM,
  STATE extends State_Either<RD, BD, RM, BM>>(
    internalStore: Writable<STATE>,
    decoratedStore: StoreSafePlain_DecoratedState_Either<RD, BD, RM, BM>,
    selectedStore: StoreUnsafe_SelectedStore<RD, BD, RM, BM>,
    stateDecorationStore: Readable<BD>,
    storeDecorationSupplier: StoreDecorationSupplier_Branch<RD, BD, RM, BM>
  ): Promise<StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM>> {
  return await new Promise(resolve => {
    internalStore.update((state: STATE) => {
      const childIndex = state.nextChildIndex;
      const selectionInfoStore: StoreSafe_DefaultStateDecoration<RD, BD, RM, BM> = maybeDerived(decoratedStore, ($parentTotal: DecoratedState_Either<RD, BD, RM, BM>) => ({
        selectedByParent: $parentTotal.selectedChild === childIndex,
        wasLastSelectedByParent: $parentTotal.lastSelected === childIndex,
        onSelectedPath: $parentTotal.onSelectedPath && $parentTotal.selectedChild === childIndex
      }), { selectedByParent: false, wasLastSelectedByParent: false, onSelectedPath: false }, (a, b) => a.selectedByParent === b.selectedByParent && a.wasLastSelectedByParent === b.wasLastSelectedByParent && a.onSelectedPath === b.onSelectedPath);
      const newChild: StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM> = createBranchStore([...state.path, childIndex], stateDecorationStore, storeDecorationSupplier, selectionInfoStore, selectedStore);
      resolve(newChild);
      const children: Record<number, StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM>> = { ...state.children };
      children[state.nextChildIndex] = newChild;
      return {
        ...state,
        children,
        nextChildIndex: childIndex + 1
      }
    })
  })
}

async function rootDeleteChild<RD, BD, RM, BM>(
  internalStore: StoreUnsafePlain_State_Root<RD, BD, RM, BM>,
  selectedStore: StoreUnsafe_SelectedStore<RD, BD, RM, BM>,
  childIdx: number
): Promise<StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM> | null> {
  return await new Promise(resolve =>
    internalStore.update((state: State_Root<RD, BD, RM, BM>) => {
      const removedChild: StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM> | undefined = state.children[childIdx];
      if (removedChild === undefined) {
        resolve(null);
        return state;
      }

      const newChildren = { ...state.children };
      delete newChildren[childIdx];

      const newState = {
        ...state,
        children: newChildren
      };

      if (state.selectedChild === childIdx) {
        newState.selectedChild = null;
        selectedStore.set(null);
      }

      if (state.lastSelected === childIdx) {
        newState.lastSelected = null;
      }

      resolve(removedChild);

      return newState;
    })
  )
}

async function rootShowChild<RD, BD, RM, BM>(
  internalStore: StoreUnsafePlain_State_Root<RD, BD, RM, BM>,
  childIdx: number
): Promise<StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM> | null> {
  return await new Promise(resolve =>
    internalStore.update((state: State_Root<RD, BD, RM, BM>) => {
      const child: StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM> | undefined = state.hiddenChildren[childIdx];
      if (child === undefined) {
        resolve(null);
        return state;
      }

      const newChildren = { ...state.children };
      const newHiddenChildren = { ...state.hiddenChildren };
      newChildren[childIdx] = child;
      delete newHiddenChildren[childIdx];

      const newState = {
        ...state,
        children: newChildren,
        hiddenChildren: newHiddenChildren
      };

      resolve(child);

      return newState;
    })
  )
}

async function rootHideChild<RD, BD, RM, BM>(
  internalStore: StoreUnsafePlain_State_Root<RD, BD, RM, BM>,
  selectedStore: StoreUnsafe_SelectedStore<RD, BD, RM, BM>,
  childIdx: number
): Promise<StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM> | null> {
  return await new Promise(resolve =>
    internalStore.update((state: State_Root<RD, BD, RM, BM>) => {
      const child: StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM> | undefined = state.children[childIdx];
      if (child === undefined) {
        resolve(null);
        return state;
      }

      const newChildren = { ...state.children };
      const newHiddenChildren = { ...state.hiddenChildren };
      newHiddenChildren[childIdx] = child;
      delete newChildren[childIdx];

      const newState = {
        ...state,
        children: newChildren,
        hiddenChildren: newHiddenChildren
      };

      if (state.selectedChild === childIdx) {
        newState.selectedChild = null;
        selectedStore.set(null);
      }

      if (state.lastSelected === childIdx) {
        newState.lastSelected = null;
      }

      resolve(child);

      return newState;
    })
  )
}

async function branchDeleteChild<RD, BD, RM, BM>(
  internalStore: StoreUnsafePlain_State_Branch<RD, BD, RM, BM>,
  select: () => void,
  childIdx: number
): Promise<StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM> | null> {
  return await new Promise(resolve =>
    internalStore.update((state: State_Branch<RD, BD, RM, BM>) => {
      const removedChild: StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM> | undefined = state.children[childIdx];
      if (removedChild === undefined) {
        resolve(null);
        return state;
      }

      const newChildren = { ...state.children };
      delete newChildren[childIdx];

      const newState = {
        ...state,
        children: newChildren
      };

      if (state.selectedChild === childIdx) {
        newState.selectedChild = null;
        select();
      }

      if (state.lastSelected === childIdx) {
        newState.lastSelected = null;
      }

      resolve(removedChild);

      return newState;
    })
  )
}

async function branchShowChild<RD, BD, RM, BM>(
  internalStore: StoreUnsafePlain_State_Branch<RD, BD, RM, BM>,
  childIdx: number
): Promise<StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM> | null> {
  return await new Promise(resolve =>
    internalStore.update((state: State_Branch<RD, BD, RM, BM>) => {
      const child: StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM> | undefined = state.hiddenChildren[childIdx];
      if (child === undefined) {
        resolve(null);
        return state;
      }

      const newChildren = { ...state.children };
      const newHiddenChildren = { ...state.hiddenChildren };
      newChildren[childIdx] = child;
      delete newHiddenChildren[childIdx];

      const newState = {
        ...state,
        children: newChildren,
        hiddenChildren: newHiddenChildren
      };

      resolve(child);

      return newState;
    })
  )
}

async function branchHideChild<RD, BD, RM, BM>(
  internalStore: StoreUnsafePlain_State_Branch<RD, BD, RM, BM>,
  select: () => void,
  childIdx: number
): Promise<StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM> | null> {
  return await new Promise(resolve =>
    internalStore.update((state: State_Branch<RD, BD, RM, BM>) => {
      const child: StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM> | undefined = state.children[childIdx];
      if (child === undefined) {
        resolve(null);
        return state;
      }

      const newChildren = { ...state.children };
      const newHiddenChildren = { ...state.hiddenChildren };
      newHiddenChildren[childIdx] = child;
      delete newChildren[childIdx];

      const newState = {
        ...state,
        children: newChildren,
        hiddenChildren: newHiddenChildren
      };

      if (state.selectedChild === childIdx) {
        newState.selectedChild = null;
        select();
      }

      if (state.lastSelected === childIdx) {
        newState.lastSelected = null;
      }

      resolve(child);

      return newState;
    })
  )
}

function nodeResetNextChildIdx<RD, BD, RM, BM>(store: StoreUnsafePlain_State_Either<RD, BD, RM, BM>): void {
  //TODO statically type this, probably by splitting into 2 funcs
  store.update((state: any) => ({
    ...state,
    nextChildIndex: Math.max(...Object.keys(state.children).map(str => parseInt(str)), 0) + 1
  }));
}

function createRootStore<RD, BD, RM, BM>(stateDecorationStore: Readable<RD>, storeDecorationSupplier_Root: StoreDecorationSupplier_Root<RD, BD, RM, BM>): StoreSafeDecorated_DecoratedState_Root<RD, BD, RM, BM> {
  const initialState: State_Root<RD, BD, RM, BM> = {
    type: "root",
    children: {},
    hiddenChildren: {},
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
    selectedChildStore_2: deriveSelectedChildStore(decoratedStateStore),
    numberOfLeavesStore: deriveNumberOfLeavesStore(decoratedStateStore),
    addChild: (stateDecorationStore: Readable<BD>, storeDecorationSupplier: StoreDecorationSupplier_Branch<RD, BD, RM, BM>) => addChild(internalStore, decoratedStateStore, mutableSelectedStore, stateDecorationStore, storeDecorationSupplier),
    select: (path: number[]) => rootSelect(internalStore, mutableSelectedStore, path),
    deleteChild: (childIdx: number) => rootDeleteChild(internalStore, mutableSelectedStore, childIdx),
    showChild: (childIdx: number) => rootShowChild(internalStore, childIdx),
    hideChild: (childIdx: number) => rootHideChild(internalStore, mutableSelectedStore, childIdx),
    resetNextChildIndex: () => nodeResetNextChildIdx(internalStore),
    selectedStore_2: mutableSelectedStore
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
    hiddenChildren: {},
    selectedChild: null,
    lastSelected: null,
    path
  };
  const internalStore: StoreUnsafePlain_State_Branch<RD, BD, RM, BM> = writable(initialState);

  const decoratedStateStore: StoreSafePlain_DecoratedState_Branch<RD, BD, RM, BM> = derived(
    [internalStore, decorationStore, selectionInfoStore],
    ([$internalStore, $decorationStore, $selectionInfoStore]) => ({
      ...$internalStore,
      ...$decorationStore,
      ...$selectionInfoStore
    }));

  let partDecorated: StoreSafePartDecorated_DecoratedState_Branch<RD, BD, RM, BM>;
  let fullyDecorated: StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM>;
  const select = () => {
    selectedStore.set(fullyDecorated)
  };
  partDecorated = {
    type: "branch" as const,
    ...decoratedStateStore,
    selectedChildStore_2: deriveSelectedChildStore(decoratedStateStore),
    numberOfLeavesStore: deriveNumberOfLeavesStore(decoratedStateStore),
    internalSelect: (path: number[]) => branchSelect(internalStore, select, path),
    addChild: (stateDecorationStore: Readable<BD>, storeDecorationSupplier: StoreDecorationSupplier_Branch<RD, BD, RM, BM>) => addChild(internalStore, decoratedStateStore, selectedStore, stateDecorationStore, storeDecorationSupplier),
    deleteChild: (childIdx: number) => branchDeleteChild(internalStore, select, childIdx),
    showChild: (childIdx: number) => branchShowChild(internalStore, childIdx),
    hideChild: (childIdx: number) => branchHideChild(internalStore, select, childIdx),
    resetNextChildIndex: () => nodeResetNextChildIdx(internalStore)
  };
  fullyDecorated = {
    ...partDecorated,
    ...storeDecorationSupplier(partDecorated)
  };
  return fullyDecorated;
}

function deriveSelectedChildStore<RD, BD, RM, BM>(parentStore: StoreSafePlain_DecoratedState_Either<RD, BD, RM, BM>): StoreSafe_SelectedStore<RD, BD, RM, BM> {
  return maybeDerived(parentStore, $parentStore => {
    let idx = $parentStore.selectedChild;
    if (idx === null) return null;

    const selected: StoreSafeDecorated_DecoratedState_Branch<RD, BD, RM, BM> | undefined = $parentStore.children[idx];
    return selected === undefined ? null : selected;
  }, null);
}

function deriveNumberOfLeavesStore(decoratedStateStore: StoreSafePlain_DecoratedState_Root<any, any, any, any>): Readable<number> {
  const summed: Readable<Readable<number>> = derived(decoratedStateStore, (state: State_Base<any, any, any, any, any>) => {
    const internalStores: StoreSafeDecorated_DecoratedState_Branch<any, any, any, any>[] = Object.values(state.children).map((child: StoreSafeDecorated_DecoratedState_Branch<any, any, any, any>) => child.numberOfLeavesStore)
    if (internalStores.length === 0) return writable(1);
    return derived(internalStores as [Readable<number>, ...Readable<number>[]], (numbers: number[]) => {
      if (numbers.length === 0) return 1;
      return numbers.reduce((a, b) => a + b, 0);
    })
  });
  return unwrapStoreNonNull<number, Readable<number>>(summed, 1);
}

export const createTree = createRootStore;