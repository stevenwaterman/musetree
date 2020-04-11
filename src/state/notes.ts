import {derived, Readable, writable} from "svelte/store";
import {TrackStore as TrackStore} from "./track";
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
export function createBranchNotesStore(parent: NotesStore, trackStore: TrackStore): NotesStore {
    return derived([parent, trackStore],
        ([$parent, $trackStore]) => {
            const parentNotes: Notes = $parent.notes;
            const childNotes: Notes = $trackStore.track.notes;
            const combinedNotes: Notes = createEmptyNotes();
            instruments.forEach(instrument => {
                combinedNotes[instrument] = [...parentNotes[instrument], ...childNotes[instrument]];
            });
            return {
                notes: combinedNotes
            };
        });
}
export function createNotesStore(parent: null | ({type: "root"}) | (Parameters<typeof createBranchNotesStore>[0] & {type: "branch"}), trackStore: TrackStore): NotesStore {
    if(parent === null) {
        return createRootNotesStore();
    } else if(parent.type === "root") {
        return createBranchNotesStore(createRootNotesStore(), trackStore);
    } else {
        return createBranchNotesStore(parent, trackStore);
    }
}