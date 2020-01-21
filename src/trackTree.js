import { writable, derived } from "svelte/store";

function createTrackTreeStore() {
  const initial = {
    selected: null,
    children: [],
    track: null,
    pendingLoad: false
  };
  const { subscribe, set, update } = writable(initial);

  return {
    subscribe,
    reset: () => set(initial),
    addTracks: (path, tracks) =>
      update(state => addChildren(state, path, tracks)),
    select: (path, idx) =>
      update(state => {
        const parent = getNode(state, path);
        parent.selected = idx;
        return state;
      }),
    setRequestStatus: (path, pending) =>
      update(state => {
        const node = getNode(state, path);
        node.pendingLoad = pending;
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
    requestStart: () => trackTreeStore.setRequestStatus(path, true),
    requestDone: () => trackTreeStore.setRequestStatus(path, false)
  };
}

function getNode(trackTree, path) {
  return path.reduce((node, direction) => node.children[direction], trackTree);
}

function addChildren(trackTree, path, tracks) {
  const leaf = getNode(trackTree, path);
  leaf.children.push(
    ...tracks.map(track => ({
      selected: null,
      children: [],
      track,
      pendingLoad: false
    }))
  );
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
    $selectedTrackStore.track ? $selectedTrackStore.track.musenetEncoding : ""
);
export const selectedTrackAudioStore = derived(
  [selectedTrackStore],
  ([$selectedTrackStore]) =>
    $selectedTrackStore.track ? $selectedTrackStore.track.audio : ""
);
