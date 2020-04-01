import {MusenetEncoding} from "../broker";
import {derived, Readable, writable} from "svelte/store";
import {TrackStore as TrackStore} from "./track";

export type EncodingState = { encoding: MusenetEncoding; }
export type EncodingStore = Readable<EncodingState>;
export function createRootEncodingStore(): EncodingStore {
    return writable({encoding: []});
}
export function createBranchEncodingStore(parent: EncodingStore, trackStore: TrackStore): EncodingStore {
    return derived([parent, trackStore],
        ([$parent, $trackStore]) => ({
            encoding: [...$parent.encoding, ...$trackStore.track.encoding]
        }));
}