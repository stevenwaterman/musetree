import { writable, derived } from "svelte/store";

function createTrackTreeStore() {
  const initial = {
    selected: null,
    lastSelected: null,
    children: {},
    childOffset: 1,
    track: null,
    pendingLoad: 0,
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
        if(idx != null){
          parent.lastSelected = idx;
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

export function deriveTrackStore(path) {
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
  return path.reduce((node, direction) => node.children[direction], trackTree);
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
    .forEach(track => {
      children[leaf.childOffset] = track;
      leaf.childOffset++;
    });
  return trackTree;
}

function getSelectedPath(trackTree) {
  const path = [];
  let tree = trackTree;
  while (true) {
    const selected = tree.selected;
    if (selected === null) return path;
    path.push(selected);
    tree = tree.children[selected];
  }
}

export const selectedPathStore = derived(
  [trackTreeStore],
  ([$trackTreeStore]) => getSelectedPath($trackTreeStore)
);
export const selectedTrackStore = derived(
  [trackTreeStore, selectedPathStore],
  ([$trackTreeStore, $selectedPathStore]) =>
    getNode($trackTreeStore, $selectedPathStore)
);
export const selectedTrackEncodingStore = derived(
  [selectedTrackStore],
  ([$selectedTrackStore]) =>
    $selectedTrackStore.track ? $selectedTrackStore.track.encoding : ""
);
export const selectedTrackAudioStore = derived(
  [selectedTrackStore],
  ([$selectedTrackStore]) =>
    $selectedTrackStore.track ? $selectedTrackStore.track.audio : ""
);
