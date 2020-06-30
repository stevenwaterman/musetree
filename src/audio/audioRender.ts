import { Piano } from "./instruments/piano";
import { Instrument } from "../constants";
import { NotesPlayer } from "./nodes/NotesPlayer";
import { Bass } from "./instruments/bass";
import { Clarinet } from "./instruments/clarinet";
import { Cello } from "./instruments/cello";
import { Flute } from "./instruments/flute";
import { Guitar } from "./instruments/guitar";
import { Harp } from "./instruments/harp";
import { Trumpet } from "./instruments/trumpet";
import { Violin } from "./instruments/violin";
import { Drums } from "./instruments/drums";
import { ProcessedNotes, ProcessedActiveNotes } from "../bridge/postProcessor";
import { Section } from "../state/section";
import { CompleteNote, noProcessedActiveNotes } from "../bridge/decoder";

export const AFTER_RELEASE = 5;

const synths: Record<Instrument, NotesPlayer> & { drums: Drums } = {
  bass: new Bass(),
  cello: new Cello(),
  clarinet: new Clarinet(),
  drums: new Drums(),
  flute: new Flute(),
  guitar: new Guitar(),
  harp: new Harp(),
  piano: new Piano(),
  trumpet: new Trumpet(),
  violin: new Violin()
};

const sampleRate = 44100;
export async function render(notes: ProcessedNotes, activeAtEnd: ProcessedActiveNotes, duration: number): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(1, duration * sampleRate, sampleRate);

  const gain = ctx.createGain();
  gain.gain.value = 0.0025;
  gain.connect(ctx.destination);

  const promises = Object.values(synths).map(it => it.schedule(ctx, gain, notes, activeAtEnd));
  await Promise.all(promises);

  return await ctx.startRendering();
}

export async function qualityRender(track: Section[]): Promise<AudioBuffer> {
  const notes: ProcessedNotes = {
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
  }

  for(let section of track) {
    const sectionNotes = Object.entries(section.notes);
    for(let pair of sectionNotes) {
      const instrument = pair[0] as Instrument;
      const instrumentNotes = pair[1];
      for(let note of instrumentNotes){
        const transposedNote: CompleteNote = {
          ...note,
          startTime: note.startTime + section.startsAt,
          endTime: note.endTime + section.startsAt
        }
        notes[instrument].push(transposedNote);
      }
    }
  }

  const duration = track[track.length - 1].endsAt;

  Object.entries(track[track.length - 1].activeNotesAtEnd)
    .forEach(([instrument, pitchMap]) => {
      const newNotes: CompleteNote[] = Object.values(pitchMap)
        .map(note => ({
          type: "COMPLETE",
          startTime: note.startTime,
          endTime: duration,
          pitch: note.pitch,
          volume: note.volume
        }));
      notes[instrument as Instrument].push(...newNotes);
    });

  const ctx = new OfflineAudioContext(1, duration * sampleRate, sampleRate);

  const gain = ctx.createGain();
  gain.gain.value = 0.0025;
  gain.connect(ctx.destination);

  const promises = Object.values(synths).map(it => it.schedule(ctx, gain, notes, noProcessedActiveNotes()));
  await Promise.all(promises);

  return await ctx.startRendering();
}

export function drumDuration(pitch: number): number | null {
  return synths.drums.durationOf(pitch);
}