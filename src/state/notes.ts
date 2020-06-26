import { derived, Readable, writable } from "svelte/store";
import { SectionState, SectionStore } from "./section";
import { Instrument, instruments } from "../constants";
import { arrayEqual } from "../utils";

export type CompleteNote = {
  type: "COMPLETE";

  /**
   * Musenet Pitch
   */
  pitch: number;

  /**
   * Start time, in seconds, relative to the start of the section
   */
  startTime: number;

  /**
   * Duration, in seconds, relative to the start of the section
   */
  endTime: number;

  /**
   * Volume on a 0..1 scale (except piano where it's 0..1.5)
   */
  volume: number;
};

export type IncompleteNote = {
  type: "INCOMPLETE";

  /**
   * Musenet Pitch
   */
  pitch: number;

  /**
   * Start time, in seconds, relative to the start of the section
   */
  startTime: number;

  /**
   * Volume on a 0..1 scale (except piano where it's 0..1.5)
   */
  volume: number;
}

export type Note = CompleteNote | IncompleteNote;
export type Notes = Record<Instrument, Note[]>;
export type NotesState = { notes: Notes; }
export type NotesStore = Readable<NotesState>;

export function createEmptyNotes(): Notes {
  const notes = {} as Notes;
  instruments.forEach(instrument => notes[instrument] = []);
  return notes;
}

export function createRootNotesStore(): NotesStore {
  return writable({ notes: createEmptyNotes() });
}
export function createBranchNotesStore(parent: NotesStore, sectionStore: SectionStore): NotesStore {
  let lastParent: Notes = createEmptyNotes();
  let lastChild: Notes = createEmptyNotes();
  return derived([parent, sectionStore], ([$parent, $sectionStore]: [NotesState, SectionState], set: (newValue: NotesState) => void) => {
    if (notesEquality($parent.notes, lastParent) && notesEquality($sectionStore.section.notes, lastChild)) return;
    lastParent = $parent.notes;
    lastChild = $sectionStore.section.notes;
    const parentNotes: Notes = $parent.notes;
    const childNotes: Notes = $sectionStore.section.notes;
    const combinedNotes: Notes = createEmptyNotes();
    instruments.forEach(instrument => {
      combinedNotes[instrument] = [...parentNotes[instrument], ...childNotes[instrument]];
    });
    set({ notes: combinedNotes });
  }, { notes: createEmptyNotes() });
}

function notesEquality(a: Notes, b: Notes) {
  for (let instrument of ["bass", "drums", "guitar", "harp", "piano", "violin", "cello", "flute", "trumpet", "clarinet"]) {
    if (!arrayEqual(a[instrument as Instrument], b[instrument as Instrument], noteEquality)) return false;
  }
  return true;
}

function noteEquality(a: Note, b: Note) {
  return a.type === b.type &&
    a.pitch === b.pitch &&
    (a.type === "COMPLETE" ? a.endTime : undefined) === (b.type === "COMPLETE" ? b.endTime : undefined) &&
    a.startTime === b.startTime &&
    a.volume === b.volume;
}

export function createNotesStore(parent: null | ({ type: "root" }) | (Parameters<typeof createBranchNotesStore>[0] & { type: "branch" }), sectionStore: SectionStore): NotesStore {
  if (parent === null) {
    return createRootNotesStore();
  } else if (parent.type === "root") {
    return createBranchNotesStore(createRootNotesStore(), sectionStore);
  } else {
    return createBranchNotesStore(parent, sectionStore);
  }
}