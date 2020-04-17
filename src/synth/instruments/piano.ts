import {ahdsr} from "../nodes/envelopes";
import {InstrumentSynth} from "../nodes/InstrumentSynth";
import {AudioNote} from "../decoder";
import {toFrequency} from "../utils";

export const coefficients = {
    decay: {
        constant: 0,
        multiplier: 1.6,
        power: -0.002
    },
    release: {
        constant: 0,
        multiplier: 0.5,
        power: -0.002
    },
    volume: {
        constant: 0,
        multiplier: 1,
        power: -0.001
    },
    pitch: {
        constant: 0,
        multiplier: 1.005,
        power: 0
    },
    brightness: {
        constant: 0,
        multiplier: 2.5,
        power: 0.0017
    }
};

const config = {
    gain: 5,
    afterOffRemain: 5,
    tricord: {
        volume: 0.2,
        lowFreqMult: 0.999,
        highReqMult: 1.001,
        attack: 0.01,
        hold: 0,
        decay: 1,
        release: 1
    },
    harmonic: {
        volume: 0.05,
        attack: 0.05,
        hold: 0,
        decay: 0.2,
        release: 0.1,
        lowpassDecay: 0.05
    },
    hammer: {
        volume: 0.00,
        attack: 0.000,
        contactTime: 0.000,
        release: 0.003,
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

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.connect(output);
    const maxFreq = fundamentalFreq * modifier("brightness", fundamentalFreq);
    console.log(fundamentalFreq, maxFreq);
    filter.frequency.setValueAtTime(maxFreq, note.startTime);
    filter.frequency.setTargetAtTime(fundamentalFreq, note.startTime, config.harmonic.lowpassDecay * modifier("decay", fundamentalFreq));

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
    }, filter);

    const harmonicOscillator = ctx.createOscillator();
    harmonicOscillator.frequency.value = fundamentalFreq;
    harmonicOscillator.type = "sawtooth";
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

        createTricord(ctx, note, detunedFreq * config.tricord.lowFreqMult).connect(outputGain);
        createTricord(ctx, note, detunedFreq).connect(outputGain);
        createTricord(ctx, note, detunedFreq * config.tricord.highReqMult).connect(outputGain);

        // const pitchFraction = note.pitch / 127;
        // const hammerRange = config.hammer.maxPosition - config.hammer.minPosition;
        // const hammerPosition = config.hammer.minPosition + pitchFraction * hammerRange;
        //
        // const hammerRelease = config.hammer.release;
        // const hammerEndTime = startTime + config.hammer.attack + config.hammer.contactTime;
        // const hammerEnvelope = ahdsr(
        //     ctx,
        //     config.hammer.volume,
        //     startTime,
        //     hammerEndTime, {
        //     attack: config.hammer.attack,
        //     hold: 0,
        //     decay: 0,
        //     sustain: 1,
        //     release: hammerRelease
        // });
        // hammerEnvelope.connect(outputGain);

        // const hammerOsc1 = ctx.createOscillator();
        // hammerOsc1.frequency.value = detunedFreq / hammerPosition;
        // hammerOsc1.start(note.startTime);
        // hammerOsc1.stop(hammerEndTime + hammerRelease * config.afterOffRemain);
        // hammerOsc1.connect(hammerEnvelope);
        //
        // const hammerOsc2 = ctx.createOscillator();
        // hammerOsc2.frequency.value = detunedFreq / (1 - hammerPosition);
        // hammerOsc2.start(note.startTime);
        // hammerOsc2.stop(hammerEndTime + hammerRelease * config.afterOffRemain);
        // hammerOsc2.connect(hammerEnvelope);
    }

}
