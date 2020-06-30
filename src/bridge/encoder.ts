import { MusenetEncoding } from "../state/encoding";
import { Instrument, instruments } from "../constants";
import { Processed } from "./postProcessor";

type BaseStartNoteEvent = {
  instrument: Instrument;
  pitch: number;
  time: number;
}

type PianoStartNoteEvent = BaseStartNoteEvent & {
  instrument: "piano",
  volume: 0 | 24 | 32 | 40 | 48 | 56 | 64 | 72 | 80 | 88 | 96 | 104 | 112 | 120
}

type DrumStartNoteEvent = BaseStartNoteEvent & {
  instrument: "drum",
  volume: 80
}

type OtherStartNoteEvent = BaseStartNoteEvent & {
  instrument: Exclude<Instrument, "piano" | "drum">,
  volume: 0 | 80
}

type StartNoteEvent = PianoStartNoteEvent | DrumStartNoteEvent | OtherStartNoteEvent;

type EndNoteEvent = {
  instrument: Exclude<Instrument, "drums">,
  pitch: number,
  volume: 0,
  time: number
}

type Event = StartNoteEvent | EndNoteEvent;

export function encode(processed: Processed): Processed {
  const events: Event[] = [];

  instruments.forEach(instrument => {
    const notes = processed.notes[instrument];
    const active = Object.values(processed.activeAtEnd[instrument]).flat();

    notes.forEach(note => {
      events.push({
        instrument,
        pitch: note.pitch,
        volume: note.volume,
        time: note.startTime
      } as StartNoteEvent)

      if (instrument !== "drums") {
        events.push({
          instrument,
          pitch: note.pitch,
          volume: 0,
          time: note.endTime
        });
      }
    });

    active.forEach(note => {
      events.push({
        instrument,
        pitch: note.pitch,
        volume: note.volume,
        time: note.startTime
      } as StartNoteEvent)
    })
  });

  events.sort((a, b) => a.time - b.time);

  let time: number = 0;
  const encoding: MusenetEncoding = [];

  function waitUntil(endTime: number) {
    const seconds = endTime - time;
    const factor = 0.00923081517;
    const delay = Math.round(seconds / factor);
    if (delay !== 0) {
      const fullDelayTokens = Math.floor(delay / 128);
      for (let i = 0; i < fullDelayTokens; i++) {
        encoding.push(4095);
      }
      const lastDelayToken = delay % 128;
      if (lastDelayToken !== 0) {
        encoding.push(3967 + lastDelayToken)
      }
      time += delay * factor;
    }
  }

  function writeToken(event: Event) {
    const idx: number = tokenInfo.findIndex(value => value[0] === event.instrument && value[1] === event.volume);
    const token = idx * 128 + event.pitch;
    encoding.push(token);
  }

  events
    .filter(event => event.time >= 0)
    .filter(event => event.time <= processed.duration)
    .forEach(event => {
      waitUntil(event.time)
      writeToken(event)
    });
  waitUntil(processed.duration);

  processed.encoding = encoding;
  return processed;
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