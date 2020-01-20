import {writable, derived} from "svelte/store";

function createTrackTreeStore(){
	const initial = {parent: null, children: [], track: null};
	const {subscribe, set, update} = writable(initial);

	return {
		subscribe,
		reset: () => set(initial),
		addTracks: (path, tracks) => update(state => setChildren(state, path, tracks))
	};
};

export const trackTreeStore = createTrackTreeStore();

export function deriveTrackStore(path){
	const store = derived([trackTreeStore], ([$trackTreeStore]) => getNode($trackTreeStore, path));
	return {
		...store,
		addTracks: tracks => trackTreeStore.addTracks(path, tracks)
	};
};

function getNode(trackTree, path){
	return path.reduce((node, direction) => node.children[direction], trackTree);
};

function setChildren(trackTree, path, tracks){
	const leaf = getNode(trackTree, path);
	leaf.children = tracks.map(track => ({parent: leaf, children: [], track}));
	return trackTree;
};

export const selectedPathStore = writable([]);
export const selectedTrackStore = derived([trackTreeStore, selectedPathStore], ([$trackTreeStore, $selectedPathStore]) => getNode($trackTreeStore, $selectedPathStore));
export const selectedTrackEncodingStore = derived([selectedTrackStore], ([$selectedTrackStore]) => $selectedTrackStore.track ? $selectedTrackStore.track.musenetEncoding : "");
export const selectedTrackAudioStore = derived([selectedTrackStore], ([$selectedTrackStore]) => $selectedTrackStore.track ? $selectedTrackStore.track.audio : "");
