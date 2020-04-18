import {ahdsr} from "../nodes/envelopes";
import {InstrumentSynth} from "../nodes/InstrumentSynth";
import {AudioNote} from "../decoder";
import {toFrequency} from "../utils";

export const coefficients = {
    decay: {
        constant: 0,
        multiplier: 2.5,
        power: -0.003
    },
    release: {
        constant: 0,
        multiplier: 0.4,
        power: -0.002
    },
    volume: {
        constant: 0,
        multiplier: 1,
        power: -0.00003
    },
    pitch: {
        constant: 0,
        multiplier: 1.005,
        power: 0
    },
    brightness: {
        constant: -6,
        multiplier: 8,
        power: 0.0015
    },
    filter: {
        constant: 0,
        multiplier: 1,
        power: -0.005
    }
};

const config = {
    gain: 2,
    afterOffRemain: 5,
    tricord: {
        // volume: 0,
        volume: 0.2,
        lowFreqMult: 0.9995,
        highReqMult: 1.0008,
        attack: 0.001,
        hold: 0.01,
        decay: 1,
        release: 1
    },
    harmonic: {
        // volume: 0,
        volume: 0.07,
        attack: 0.01,
        hold: 0,
        decay: 1,
        release: 1
    },
    hammer: {
        // volume: 0,
        volume: 0.08,
        attack: 0.001,
        contactTime: 0.002,
        release: 0.2,
        minPosition: 1/7,
        maxPosition: 1/15
    }
};

export function modifier(value: keyof typeof coefficients, frequency: number): number {
    const {constant, multiplier, power} = coefficients[value];
    return constant + multiplier * Math.pow(2, frequency * power);
}

function createTricord(ctx: BaseAudioContext, note: AudioNote, fundamentalFreq: number) {
    const output = ctx.createGain();
    output.gain.value = 1;

    const fundamentalRelease = config.tricord.release * modifier("release", fundamentalFreq);
    const fundamentalEnvelope = ahdsr(
        ctx,
        note.volume * config.tricord.volume * modifier("volume", fundamentalFreq),
        note.startTime + config.hammer.attack,
        note.endTime,
        {
        attack: config.tricord.attack,
        hold: config.tricord.hold,
        decay: config.tricord.decay * modifier("decay", fundamentalFreq),
        sustain: 0,
        release: fundamentalRelease
    }, output);
    const fundamentalOscillator = ctx.createOscillator();
    fundamentalOscillator.frequency.value = fundamentalFreq;
    fundamentalOscillator.start(ctx.currentTime + note.startTime);
    fundamentalOscillator.stop(ctx.currentTime + note.endTime + config.afterOffRemain * fundamentalRelease);
    fundamentalOscillator.connect(fundamentalEnvelope);

    const harmonicFreq = fundamentalFreq * 2;
    const harmonicRelease = config.harmonic.release * modifier("release", harmonicFreq);
    const harmonicEnvelope = ahdsr(
        ctx,
        note.volume * config.harmonic.volume * modifier("volume", harmonicFreq),
        note.startTime + config.hammer.attack,
        note.endTime, {
        attack: config.harmonic.attack,
        hold: config.harmonic.hold,
        decay: config.harmonic.decay * modifier("decay", harmonicFreq),
        sustain: 0,
        release: harmonicRelease
    }, output);

    const real = new Float32Array(15);
    const imag = new Float32Array(15);
    real.fill(1);
    imag.fill(0);
    real[0] = 0;
    const harmonicWave = ctx.createPeriodicWave(real, imag);

    const harmonicOscillator = ctx.createOscillator();
    harmonicOscillator.frequency.value = fundamentalFreq;
    harmonicOscillator.setPeriodicWave(harmonicWave);
    harmonicOscillator.start(ctx.currentTime + note.startTime);
    harmonicOscillator.stop(ctx.currentTime + note.endTime + config.afterOffRemain * harmonicRelease);
    harmonicOscillator.connect(harmonicEnvelope);


    return output;
}

export class Piano extends InstrumentSynth<"piano"> {
    protected instrument = "piano" as const;

    async setup(ctx: BaseAudioContext, destination: AudioNode): Promise<void> {
    }

    async loadNote(note: AudioNote, ctx: BaseAudioContext, destination: AudioNode): Promise<void> {
        const outputGain = ctx.createGain();
        outputGain.gain.value = config.gain;
        outputGain.connect(destination);

        const idealFreq = toFrequency(note.pitch);
        const detunedFreq = idealFreq * modifier("pitch", idealFreq);

        const filter = ctx.createBiquadFilter();
        const filterDecay = modifier("filter", detunedFreq);
        filter.type = "lowpass";
        filter.connect(outputGain);
        const maxFreq = detunedFreq * 10;
        filter.frequency.value = maxFreq;
        filter.frequency.setTargetAtTime(detunedFreq, note.startTime, filterDecay);

        createTricord(ctx, note, detunedFreq * config.tricord.lowFreqMult).connect(filter);
        createTricord(ctx, note, detunedFreq).connect(filter);
        createTricord(ctx, note, detunedFreq * config.tricord.highReqMult).connect(filter);
    }
}
