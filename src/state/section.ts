import {writable, Writable} from "svelte/store";
import {MusenetEncoding} from "./encoding";
import {Notes} from "./notes";

export type Section = {
    encoding: MusenetEncoding;
    startsAt: number;
    endsAt: number;
    notes: Notes;
    audio: AudioBuffer;
}
export type SectionState = { section: Section; };
export type SectionStore = Writable<SectionState>;
export function createSectionStore(initial: Section): SectionStore {
    const initialState = {section: initial};
    return writable(initialState);
}