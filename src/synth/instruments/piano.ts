import {ahdsr} from "../nodes/envelopes";
import {InstrumentSynth} from "../nodes/InstrumentSynth";
import {AudioNote} from "../decoder";
import {toFrequency} from "../utils";
import {pitchMin, pitchRange} from "../../constants";

function decayFactor(freq: number) {
    return Math.pow(2, -freq / 4000);
}

function releaseFactor(freq: number) {
    return Math.pow(2, -freq/4000);
}

function volumeFactor(freq: number) {
    return Math.pow(2, -freq/4000);
}

function pitchFactor(freq: number) {
    return freq * 1.005;
}

function createTricord(ctx: BaseAudioContext, note: AudioNote, fundamentalFreq: number) {
    const output = ctx.createGain();
    output.gain.value = 1;

    const envelope = ahdsr(ctx, 0.4 * note.volume * volumeFactor(fundamentalFreq), note.startTime, note.endTime, {
        attack: 0.01,
        hold: 0,
        decay: 1 * decayFactor(fundamentalFreq),
        sustain: 0,
        release: 0.3 * releaseFactor(fundamentalFreq)
    });
    envelope.connect(output);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.connect(envelope);

    const filterEnvelope = ahdsr(ctx, fundamentalFreq * 10, note.startTime, note.endTime + 1 * releaseFactor(fundamentalFreq), {
        attack: 0.001,
        hold: 0,
        decay: 0.25 * decayFactor(fundamentalFreq),
        sustain: 0.15,
        release: 0
    });
    filterEnvelope.connect(filter.frequency);

    const oscillator = ctx.createOscillator();
    oscillator.frequency.value = fundamentalFreq;
    oscillator.type = "sawtooth";
    oscillator.start(note.startTime);
    oscillator.stop(note.endTime + 1 * releaseFactor(fundamentalFreq));
    oscillator.connect(filter);

    return output;
}

export class Piano extends InstrumentSynth<"piano"> {
    protected instrument = "piano" as const;


    async setup(ctx: OfflineAudioContext, destination: AudioNode): Promise<void> {
    }

    async loadNote(note: AudioNote, ctx: BaseAudioContext, destination: AudioNode): Promise<void> {
        const idealFreq = pitchFactor(toFrequency(note.pitch));
        const startTime = note.startTime;

        createTricord(ctx, note, idealFreq * 0.997).connect(destination);
        createTricord(ctx, note, idealFreq).connect(destination);
        createTricord(ctx, note, idealFreq * 1.005).connect(destination);

        const hammerMin = 1 / 7;
        const hammerMax = 1 / 15;
        const pitchFraction = (note.pitch - pitchMin) / pitchRange;
        const hammerRange = hammerMax - hammerMin;
        const hammerPosition = hammerMin + pitchFraction * hammerRange;

        const hammerContactTime = 0.005;
        const hammerEnvelope = ahdsr(ctx, 0.02, startTime, startTime + hammerContactTime, {
            attack: 0.001,
            hold: 0,
            decay: 0,
            sustain: 1,
            release: 0.01
        });
        hammerEnvelope.connect(destination);

        const hammerOsc1 = ctx.createOscillator();
        hammerOsc1.frequency.value = idealFreq / hammerPosition;
        hammerOsc1.start(note.startTime);
        hammerOsc1.stop(note.startTime + hammerContactTime + 0.25);
        hammerOsc1.connect(hammerEnvelope);

        const hammerOsc2 = ctx.createOscillator();
        hammerOsc2.frequency.value = idealFreq / (1 - hammerPosition);
        hammerOsc2.start(note.startTime);
        hammerOsc2.stop(note.startTime + hammerContactTime + 0.25);
        hammerOsc2.connect(hammerEnvelope);
    }

}
