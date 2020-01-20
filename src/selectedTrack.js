import {writable, derived} from "svelte/store";

export const selectedTrackStore = writable(null);
export const selectedTrackEncodingStore = derived([selectedTrackStore], ([$selectedTrackStore]) => $selectedTrackStore ? $selectedTrackStore.musenetEncoding : "");
export const selectedTrackAudioStore = derived([selectedTrackStore], ([$selectedTrackStore]) => $selectedTrackStore ? $selectedTrackStore.audio : "");
