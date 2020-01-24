import { writable, derived } from "svelte/store";

function createTrackTreeStore() {
  const initial = {
    selected: null,
    lastSelected: null,
    children: {},
    childOffset: 1,
    track: null,
    pendingLoad: 0
  };
  const { subscribe, set, update } = writable(initial);

  return {
    subscribe,
    set,
    reset: () => set(initial),
    addTracks: (path, tracks) =>
      update(state => addChildren(state, path, tracks)),
    select: (path, idx) =>
      update(state => {
        const parent = getNode(state, path);
        parent.selected = idx;
        if (idx != null) {
          parent.lastSelected = idx;
        }
        return state;
      }),
    selectFullPath: (path, exact) => update(state => {
      let tree = state;
      path.forEach(direction => {
        tree.selected = direction;
        tree.lastSelected = direction;
        tree = tree.children[direction];
        if(tree == null) return;
      });
      if(exact && tree != null){
        tree.lastSelected = tree.selected;
        tree.selected = null;
      }
      return state;
    }),
    requestStart: path =>
      update(state => {
        const node = getNode(state, path);
        node.pendingLoad++;
        return state;
      }),
    requestDone: path =>
      update(state => {
        const node = getNode(state, path);
        node.pendingLoad--;
        return state;
      }),
    deleteChild: (path, childId) =>
      update(state => {
        const node = getNode(state, path);
        delete node.children[childId];
        return state;
      })
  };
}

export const trackTreeStore = createTrackTreeStore();

export function deriveNodeStore(path) {
  const store = derived([trackTreeStore], ([$trackTreeStore]) =>
    getNode($trackTreeStore, path)
  );
  return {
    ...store,
    select: idx => trackTreeStore.select(path, idx),
    requestStart: () => trackTreeStore.requestStart(path),
    requestDone: () => trackTreeStore.requestDone(path),
    deleteChild: childId => trackTreeStore.deleteChild(path, childId),
    deselect: () => trackTreeStore.select(path.slice(0, -1), null)
  };
}

function getNode(trackTree, path) {
  return path.reduce((node, direction) => node ? node.children[direction]: null, trackTree);
}

function addChildren(trackTree, path, tracks) {
  const leaf = getNode(trackTree, path);
  delete leaf.audio;

  const children = leaf.children;
  tracks
    .map(track => ({
      selected: null,
      lastSelected: null,
      children: {},
      childOffset: 1,
      track,
      pendingLoad: false
    }))
    .forEach(node => {
      children[leaf.childOffset] = node;
      leaf.childOffset++;
    });
  return trackTree;
}

function getSelectedPath(trackTree) {
  const path = [];
  let tree = trackTree;
  while (true) {
    const selected = tree.selected;
    if (selected == null) return path;
    tree = tree.children[selected];
    if (tree == null) return path;
    path.push(selected);
  }
}

function getSelectedNode(trackTree){
  let node = trackTree;
  while (true) {
    const selected = node.selected;
    if (selected == null) return node;
    const newTree = node.children[selected];
    if (newTree == null) return node;
    node = newTree;
  }
}

export const selectedPathStore = derived(
  [trackTreeStore],
  ([$trackTreeStore]) => getSelectedPath($trackTreeStore)
);
export const selectedNodeStore = derived(
  [trackTreeStore],
  ([$trackTreeStore]) =>
    getSelectedNode($trackTreeStore)
);

export const selectedTrackStore = derived([selectedNodeStore], ([$selectedNodeStore]) => $selectedNodeStore ? $selectedNodeStore.track : null)

export const selectedTrackEncodingStore = derived(
  [selectedTrackStore],
  ([$selectedTrackStore]) =>
    $selectedTrackStore ? $selectedTrackStore.encoding : ""
);
export const selectedTrackAudioStore = derived(
  [selectedTrackStore],
  ([$selectedTrackStore]) =>
    $selectedTrackStore ? $selectedTrackStore.audio : ""
);

export const d3TreeStore = derived([trackTreeStore], ([$trackTreeStore]) =>
  toD3data($trackTreeStore, {
    name: "",
    isSelected: true,
    wasSelected: true,
    path: [],
    startsAt: 0,
    pendingLoad: $trackTreeStore.pendingLoad
  })
);

function toD3data(tree, config) {
  const {selected, lastSelected, children: treeChildren} = tree;
  const d3Children = Object.entries(treeChildren).map(([idx, child]) =>
    toD3data(child, {
      name: idx,
      isSelected: idx === selected && config.isSelected,
      wasSelected: idx === selected || idx === lastSelected,
      path: [...config.path, idx],
      startsAt: child.track.startsAt,
      pendingLoad: child.pendingLoad
    })
  );
  return {
    ...config,
    children: d3Children
  };
}
