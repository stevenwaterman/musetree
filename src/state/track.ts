import {Track} from "../broker";
import {writable, Writable} from "svelte/store";

export type TrackState = { track: Track; };
export type TrackStore = Writable<TrackState>;
export function createTrackStore(initialTrack: Track): TrackStore {
    const initialState = {track: initialTrack};
    return writable(initialState);
}