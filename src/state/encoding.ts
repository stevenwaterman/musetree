import {derived, Readable, writable} from "svelte/store";
import {SectionStore} from "./section";

export type MusenetEncoding = number[];
export type EncodingState = { encoding: MusenetEncoding; }
export type EncodingStore = Readable<EncodingState>;

export function createRootEncodingStore(): EncodingStore {
    return writable({encoding: []});
}
export function createBranchEncodingStore(parent: EncodingStore, sectionStore: SectionStore): EncodingStore {
    return derived([parent, sectionStore],
        ([$parent, $sectionStore]) => ({
            encoding: [...$parent.encoding, ...$sectionStore.section.encoding]
        }));
}
export function createEncodingStore(parent: null | ({type: "root"}) | (Parameters<typeof createBranchEncodingStore>[0] & {type: "branch"}), sectionStore: SectionStore): EncodingStore {
    if(parent === null) {
        return createRootEncodingStore();
    } else if(parent.type === "root") {
        return createBranchEncodingStore(createRootEncodingStore(), sectionStore);
    } else {
        return createBranchEncodingStore(parent, sectionStore);
    }
}