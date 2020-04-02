import {MusenetEncoding} from "../broker";
import {derived, Readable, writable} from "svelte/store";
import {TrackStore as TrackStore} from "./track";
import {NodeStore} from "./trackTree";

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
export function createEncodingStore(parent: NodeStore | null, trackStore: TrackStore): EncodingStore {
    if(parent === null) {
        return createRootEncodingStore();
    } else if(parent.type === "root") {
        return createBranchEncodingStore(writable({encoding: []}), trackStore);
    } else {
        return createBranchEncodingStore(parent, trackStore);
    }
}