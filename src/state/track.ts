import {writable, Writable} from "svelte/store";
import {MusenetEncoding} from "./encoding";
import {Notes} from "./notes";

export type Track = {
    encoding: MusenetEncoding;
    startsAt: number;
    endsAt: number;
    notes: Notes;
}
export type TrackState = { track: Track; };
export type TrackStore = Writable<TrackState>;
export function createTrackStore(initialTrack: Track): TrackStore {
    const initialState = {track: initialTrack};
    return writable(initialState);
}