import { InstrumentNotes, CompleteNote, InstrumentActiveNotes, IncompleteNote, Decoded } from "./decoder";
import { instruments, Instrument } from "../constants";
import { maxNoteLengths, minNoteLengths, minNoteSeparation } from "./postProcessSettings";
import { MusenetEncoding } from "../state/encoding";
import { encode } from "./encoder";
import { drumDuration } from "../audio/audioRender";

export type ProcessedInstrumentNotes = CompleteNote[];
export type ProcessedNotes = Record<Instrument, ProcessedInstrumentNotes>;
export type ProcessedInstrumentActiveNotes = Record<number, IncompleteNote>;
export type ProcessedActiveNotes = Record<Instrument, ProcessedInstrumentActiveNotes>;
export type Processed = {
  notes: ProcessedNotes,
  activeAtEnd: ProcessedActiveNotes,
  duration: number,
  encoding: MusenetEncoding
}

function redundantStop(notes: InstrumentNotes): ProcessedInstrumentNotes {
  // Prevents redundant note stop events. Removes UNSTARTED notes
  return notes.filter(note => note.type !== "UNSTARTED") as ProcessedInstrumentNotes;
}

function sort<T extends Array<{ startTime: number }>>(notes: T): T {
  // Order the notes based on start time
  return notes.sort((a, b) => a.startTime - b.startTime);
}

function minSeparation(instrument: Instrument, notes: ProcessedInstrumentNotes, active: InstrumentActiveNotes): [ProcessedInstrumentNotes, ProcessedInstrumentActiveNotes] {
  // Prevents notes from overlapping and leaves the specified gap between them. Shortens the first note to fit.
  const minGap: number = instrument === "drums" ? 0 : minNoteSeparation[instrument];

  const noteEvents: Array<CompleteNote | IncompleteNote> = sort([...notes, ...Object.values(active).flat()]);

  const eventsPerPitch: Record<number, Array<CompleteNote | IncompleteNote>> = {};
  noteEvents.forEach(event => {
    if (eventsPerPitch[event.pitch] === undefined) eventsPerPitch[event.pitch] = [];
    eventsPerPitch[event.pitch].push(event);
  })

  const processedNotes: ProcessedInstrumentNotes = [];
  const processedActive: ProcessedInstrumentActiveNotes = {}
  Object.values(eventsPerPitch)
    .forEach((events: Array<CompleteNote | IncompleteNote>) => {
      let last: CompleteNote | IncompleteNote | null = null;

      for (let event of events) {
        if (last !== null) {
          if (last.type === "INCOMPLETE" || last.endTime > event.startTime - minGap) {
            last = {
              ...last,
              type: "COMPLETE",
              endTime: Math.max(0, event.startTime - minGap),
            };
          }

          processedNotes.push(last);
        }

        last = event;
      }

      if (last !== null) {
        if (last.type === "COMPLETE") {
          processedNotes.push(last);
        } else {
          processedActive[last.pitch] = last;
        }
      }
    });

  return [processedNotes, processedActive];
}

function maxLength(instrument: Instrument, duration: number, notes: ProcessedInstrumentNotes, active: ProcessedInstrumentActiveNotes): [ProcessedInstrumentNotes, ProcessedInstrumentActiveNotes] {
  // Adds a note stop when a note has been playing for too long.
  const maxLengthFunction: (pitch: number) => number | null = instrument === "drums" ? drumDuration : () => maxNoteLengths[instrument];

  notes.forEach(note => {
    const maxLength = maxLengthFunction(note.pitch);
    if (maxLength !== null) note.endTime = Math.min(note.endTime, note.startTime + maxLength);
  });

  const outputActive: ProcessedInstrumentActiveNotes = {};
  Object.values(active).forEach(note => {
    const pitch = note.pitch;
    const noteLength = duration - note.startTime;
    const maxLength = maxLengthFunction(pitch);
    if (maxLength !== null && noteLength > maxLength) {
      notes.push({
        ...note,
        type: "COMPLETE",
        endTime: note.startTime + maxLength
      });
    } else {
      outputActive[pitch] = note;
    }
  });

  return [sort(notes), outputActive];
}

function minLength(instrument: Exclude<Instrument, "drums">, duration: number, notes: ProcessedInstrumentNotes, active: InstrumentActiveNotes): [ProcessedInstrumentNotes, InstrumentActiveNotes] {
  // Extends the length of a note when it is too short.
  const minLength = minNoteLengths[instrument];
  if (minLength === null) return [notes, active]

  const stayComplete: CompleteNote[] = [];
  const makeActive: IncompleteNote[] = [];

  notes.forEach(note => {
    const noteLength = note.endTime - note.startTime;
    if (noteLength < minLength) {
      const newEndTime = note.startTime + minLength;
      if (newEndTime > duration) {
        makeActive.push({
          ...note,
          type: "INCOMPLETE"
        });
      } else {
        stayComplete.push({
          ...note,
          endTime: note.startTime + minLength
        })
      }
    } else {
      stayComplete.push(note);
    }
  });

  makeActive.forEach(note => {
    const pitchActive: IncompleteNote[] | undefined = active[note.pitch];
    if (pitchActive === undefined) {
      active[note.pitch] = [note];
    } else {
      pitchActive.push(note);
    }
  })

  return [stayComplete, active];
}

function noBackwardsNotes(notes: ProcessedInstrumentNotes): ProcessedInstrumentNotes {
  return notes.filter(note => note.startTime < note.endTime);
}

export function postProcess(decoded: Decoded): Processed {
  // Applies all postprocessing steps according to settings
  const output: Processed = {
    notes: {
      piano: [],
      violin: [],
      cello: [],
      bass: [],
      guitar: [],
      flute: [],
      clarinet: [],
      trumpet: [],
      harp: [],
      drums: []
    },
    activeAtEnd: {
      piano: {},
      violin: {},
      cello: {},
      bass: {},
      guitar: {},
      flute: {},
      clarinet: {},
      trumpet: {},
      harp: {},
      drums: {}
    },
    duration: decoded.duration,
    encoding: []
  };


  instruments.forEach(instrument => {
    const decodedNotes: InstrumentNotes = decoded.notes[instrument];
    let processingNotes: ProcessedInstrumentNotes = redundantStop(decodedNotes);
    processingNotes = sort(processingNotes);

    let decodedActive: InstrumentActiveNotes = decoded.activeAtEnd[instrument];

    if (instrument !== "drums") {
      const [minLengthNotes, minLengthActive] = minLength(instrument, decoded.duration, processingNotes, decodedActive);
      processingNotes = minLengthNotes;
      decodedActive = minLengthActive;
    }

    const [noOverlapNotes, noOverlapActive] = minSeparation(instrument, processingNotes, decodedActive);
    processingNotes = noOverlapNotes;
    let processedActive = noOverlapActive;

    const [maxLengthNotes, maxLengthActive] = maxLength(instrument, decoded.duration, processingNotes, processedActive);
    processingNotes = maxLengthNotes;
    processedActive = maxLengthActive;

    processingNotes = noBackwardsNotes(processingNotes);

    output.notes[instrument] = processingNotes;
    output.activeAtEnd[instrument] = processedActive;
  })

  return encode(output);
}


