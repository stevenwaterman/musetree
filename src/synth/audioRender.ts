import {Piano} from "./instruments/piano";
import {Instrument} from "../constants";
import {SynthInstrument} from "./instruments/synthInstrument";
import {MusenetEncoding} from "../state/encoding";
import {AudioNotes, decode} from "./decoder";

const synths: Partial<Record<Instrument, SynthInstrument<Instrument>>> = {
    piano: new Piano(),
};

const sampleRate = 44100;
async function render(notes: AudioNotes, duration: number): Promise<AudioBuffer> {
    const ctx = new OfflineAudioContext(1, duration * sampleRate, sampleRate);
    const destination = ctx.destination;

    synths.piano?.schedule(ctx, destination, notes);

    return await ctx.startRendering();
}

export async function renderAudio(encoding: MusenetEncoding, duration: number) {
    const notes = decode(encoding);
    console.log(encoding, notes);
    return await render(notes, duration);
}
