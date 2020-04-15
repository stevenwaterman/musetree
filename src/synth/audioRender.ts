import {Piano} from "./instruments/piano";
import {Instrument} from "../constants";
import {SynthInstrument} from "./nodes/synthInstrument";
import {MusenetEncoding} from "../state/encoding";
import {AudioNotes, decode} from "./decoder";
import {Bass} from "./instruments/bass";
import {Clarinet} from "./instruments/clarinet";
import {Cello} from "./instruments/cello";
import {Flute} from "./instruments/flute";
import {Guitar} from "./instruments/guitar";
import {Harp} from "./instruments/harp";
import {Trumpet} from "./instruments/trumpet";
import {Violin} from "./instruments/violin";

const synths: Partial<Record<Instrument, SynthInstrument<Instrument>>> = {
    bass: new Bass(),
    cello: new Cello(),
    clarinet: new Clarinet(),
    flute: new Flute(),
    guitar: new Guitar(),
    harp: new Harp(),
    piano: new Piano(),
    trumpet: new Trumpet(),
    violin: new Violin()
};

const sampleRate = 48000;
async function render(notes: AudioNotes, duration: number): Promise<AudioBuffer> {
    const ctx = new OfflineAudioContext(1, duration * sampleRate, sampleRate);


    const gain = ctx.createGain();
    gain.gain.value = 0.2;
    gain.connect(ctx.destination);

    Object.values(synths).forEach(synth => synth && synth.schedule(ctx, gain, notes));
    console.log(ctx.currentTime);

    return await ctx.startRendering();
}

export async function renderAudio(encoding: MusenetEncoding, duration: number) {
    const notes = decode(encoding);
    console.log(encoding, notes, duration);
    return await render(notes, duration);
}
