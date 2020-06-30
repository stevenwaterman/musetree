import { MusenetEncoding } from "../state/encoding";
import { Instrument } from "../constants";
import { drumDuration } from "../audio/audioRender";
import { ProcessedActiveNotes } from "./postProcessor";

export type CompleteNote = Omit<IncompleteNote, "type"> & {
  type: "COMPLETE";

  /**
   * Duration, in seconds, relative to the start of the section
   */
  endTime: number;
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

  volume: 0 | 8 | 16 | 24 | 32 | 40 | 48 | 56 | 64 | 72 | 80 | 88 | 96 | 104 | 112 | 120;
}

export type UnstartedNote = {
  type: "UNSTARTED";
  pitch: number;
  endTime: number;
}

export type InstrumentNotes = (CompleteNote | UnstartedNote)[];
export type InstrumentActiveNotes = Record<number, IncompleteNote[]>;

export type DecodedNotes = Record<Instrument, InstrumentNotes>;
export type DecodedActiveNotes = Record<Instrument, InstrumentActiveNotes>;
export type Decoded = {
  notes: DecodedNotes,
  activeAtEnd: DecodedActiveNotes,
  duration: number
}

export function noActiveNotes(): DecodedActiveNotes {
  return {
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
  }
}

export function noProcessedActiveNotes(): ProcessedActiveNotes {
  return {
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
  }
}

export function decode(encoded: MusenetEncoding, activeNotesAtStart: ProcessedActiveNotes): Decoded {
  const notes: DecodedNotes = {
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
  };

  const activeNotes: DecodedActiveNotes = noActiveNotes();
  Object.entries(activeNotesAtStart).forEach(([instrument, pitchMap]) => Object.values(pitchMap).forEach(note => {
    activeNotes[instrument as Instrument][note.pitch] = [note];
  }))

  let time: number = 0;

  const tokens: Token[] = encoded.map(encodingToToken).filter(it => it !== null) as Token[];

  function noteStart(instrument: Instrument, pitch: number, volume: number) {
    const note: IncompleteNote = {
      type: "INCOMPLETE",
      startTime: time,
      pitch: Math.round(pitch),
      volume: volume as IncompleteNote["volume"]
    };

    const active = activeNotes[instrument][pitch];
    if (active === undefined) {
      activeNotes[instrument][pitch] = [note]
    } else {
      active.push(note);
    }
  }

  function noteEnd(instrument: Instrument, pitch: number) {
    const active: IncompleteNote[] = activeNotes[instrument][pitch];
    if (active === undefined || active.length === 0) {
      notes[instrument].push({
        type: "UNSTARTED",
        endTime: time,
        pitch: Math.round(pitch)
      });
      return;
    }

    const { startTime, volume } = active.shift() as IncompleteNote;
    notes[instrument].push({
      type: "COMPLETE",
      startTime,
      endTime: time,
      pitch,
      volume
    });

    if (active.length === 0) {
      delete activeNotes[instrument][pitch];
    }
  }

  function drumNote(pitch: number) {
    const duration = drumDuration(pitch);
    if (duration !== null) {
      notes.drums.push({
        type: "COMPLETE",
        startTime: time,
        endTime: time + duration,
        pitch: pitch,
        volume: 80
      })
    }

  }

  function wait(delay: number) {
    const factor = 0.00923081517;
    const seconds = delay * factor;
    time += seconds;
  }

  for (const token of tokens) {
    if (token.type === "note") {
      const { instrument, pitch } = token;
      if (instrument === "drums") {
        drumNote(pitch);
      } else if (token.volume === 0) {
        noteEnd(instrument, pitch);
      } else {
        noteStart(instrument, pitch, token.volume);
      }
    } else { wait(token.delay) }
  }

  const newDrumNotes: CompleteNote[] = [];
  notes.drums.forEach(elem => {
    const note = elem as CompleteNote;
    if (note.endTime > time) {
      const incompleteNote: IncompleteNote = {
        type: "INCOMPLETE",
        startTime: note.startTime,
        pitch: note.pitch,
        volume: 80
      };
      const active = activeNotes.drums[note.pitch];
      if (active === undefined) {
        activeNotes.drums[note.pitch] = [incompleteNote]
      } else {
        active.push(incompleteNote);
      }
    } else {
      newDrumNotes.push(note);
    }
  })
  notes.drums = newDrumNotes;

  return {
    notes,
    activeAtEnd: activeNotes,
    duration: time
  };
}

type TokenBase<TYPE extends string> = {
  type: TYPE
}

type TokenNote = TokenBase<"note"> & {
  pitch: number;
  instrument: Instrument;
  volume: number;
}

type TokenWait = TokenBase<"wait"> & {
  delay: number;
}

export type Token = TokenNote | TokenWait;

const tokenInfo = [
  ["piano", 0],
  ["piano", 24],
  ["piano", 32],
  ["piano", 40],
  ["piano", 48],
  ["piano", 56],
  ["piano", 64],
  ["piano", 72],
  ["piano", 80],
  ["piano", 88],
  ["piano", 96],
  ["piano", 104],
  ["piano", 112],
  ["piano", 120],
  ["violin", 80],
  ["violin", 0],
  ["cello", 80],
  ["cello", 0],
  ["bass", 80],
  ["bass", 0],
  ["guitar", 80],
  ["guitar", 0],
  ["flute", 80],
  ["flute", 0],
  ["clarinet", 80],
  ["clarinet", 0],
  ["trumpet", 80],
  ["trumpet", 0],
  ["harp", 80],
  ["harp", 0],
  ["drums", 80]
] as const;


export function encodingToToken(encoded: number): Token | null {
  if (encoded >= 0 && encoded < 3968) {
    const [instrument, volume] = tokenInfo[encoded >> 7];
    return { type: "note", pitch: encoded % 128, instrument, volume };
  }
  if (encoded < 4096) return { type: "wait", delay: (encoded % 128) + 1 };
  if (encoded === 4097) return { type: "wait", delay: (4067 % 128) + 1 };
  return null;
}