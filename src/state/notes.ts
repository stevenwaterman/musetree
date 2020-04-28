import {derived, Readable, writable} from "svelte/store";
import {SectionStore} from "./section";
import {Instrument, instruments} from "../constants";

export type Note = {
    time_on: number;
    pitch: number;
    duration: number;
}
export type Notes = Record<Instrument, Note[]>;
export type NotesState = { notes: Notes; }
export type NotesStore = Readable<NotesState>;

export function createEmptyNotes(): Notes {
    const notes = {} as Notes;
    instruments.forEach(instrument => notes[instrument] = []);
    return notes;
}

export function createRootNotesStore(): NotesStore {
    return writable({notes: createEmptyNotes()});
}
export function createBranchNotesStore(parent: NotesStore, sectionStore: SectionStore): NotesStore {
    return derived([parent, sectionStore],
        ([$parent, $sectionStore]) => {
            const parentNotes: Notes = $parent.notes;
            const childNotes: Notes = $sectionStore.section.notes;
            const combinedNotes: Notes = createEmptyNotes();
            instruments.forEach(instrument => {
                combinedNotes[instrument] = [...parentNotes[instrument], ...childNotes[instrument]];
            });
            return {
                notes: combinedNotes
            };
        });
}
export function createNotesStore(parent: null | ({type: "root"}) | (Parameters<typeof createBranchNotesStore>[0] & {type: "branch"}), sectionStore: SectionStore): NotesStore {
    if(parent === null) {
        return createRootNotesStore();
    } else if(parent.type === "root") {
        return createBranchNotesStore(createRootNotesStore(), sectionStore);
    } else {
        return createBranchNotesStore(parent, sectionStore);
    }
}