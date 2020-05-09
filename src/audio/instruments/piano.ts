import {AhdEnvelope, AhdsrEnvelope, ENVELOPE_AHD, ENVELOPE_AHDSR} from "../nodes/envelopes";
import {InstrumentSynth} from "../nodes/InstrumentSynth";
import {toFrequency} from "../utils";
import {AFTER_RELEASE} from "../audioRender";
import {Note} from "../../state/notes";

export class Piano extends InstrumentSynth<"piano"> {
    protected instrument: "piano" = "piano";

    async setup(ctx: BaseAudioContext, destination: AudioNode): Promise<void> {
    }

    async loadNote(note: Note, ctx: BaseAudioContext, destination: AudioNode): Promise<void> {
        const node = new PianoNode(ctx);
        node.frequencyParam.value = toFrequency(note.pitch);
        node.connect(destination);
        node.schedule(note);
    }
}

class PianoNode {
    private static readonly VOLUME = 0.2;
    private static readonly DETUNE = 1.003;
    private static readonly LOW_FREQ_MULT = 0.9997;
    private static readonly HIGH_FREQ_MULT = 1.0008;

    private static readonly LOW_PASS_ENVELOPE: ENVELOPE_AHD = {
        attack: 0,
        hold: 0.01,
        decay: 0.5
    }

    private readonly idealFrequency: ConstantSourceNode;
    readonly frequencyParam: AudioParam;

    private readonly lowFrequency: GainNode;
    private readonly midFrequency: GainNode;
    private readonly highFrequency: GainNode;

    private readonly lowTricord: TricordNode;
    private readonly midTricord: TricordNode;
    private readonly highTricord: TricordNode;
    private readonly hammer: HammerNode;

    private readonly lowpass: BiquadFilterNode;
    private lowpassEnvelope: AhdEnvelope;

    private readonly output: GainNode;

    constructor(ctx: BaseAudioContext) {
        this.idealFrequency = ctx.createConstantSource();
        this.frequencyParam = this.idealFrequency.offset;

        this.midFrequency = ctx.createGain();
        this.midFrequency.gain.value = PianoNode.DETUNE;
        this.idealFrequency.connect(this.midFrequency);

        this.lowFrequency = ctx.createGain();
        this.lowFrequency.gain.value = PianoNode.LOW_FREQ_MULT;
        this.midFrequency.connect(this.lowFrequency);

        this.highFrequency = ctx.createGain();
        this.highFrequency.gain.value = PianoNode.HIGH_FREQ_MULT;
        this.midFrequency.connect(this.highFrequency);

        this.lowTricord = new TricordNode(ctx);
        this.midTricord = new TricordNode(ctx);
        this.highTricord = new TricordNode(ctx);

        this.lowFrequency.connect(this.lowTricord.frequencyParam);
        this.midFrequency.connect(this.midTricord.frequencyParam);
        this.highFrequency.connect(this.highTricord.frequencyParam);

        this.lowpass = ctx.createBiquadFilter();
        this.lowpass.type = "lowpass";
        this.lowpassEnvelope = new AhdEnvelope(ctx, 30, PianoNode.LOW_PASS_ENVELOPE);
        this.midFrequency.connect(this.lowpassEnvelope.input);
        this.lowpassEnvelope.connect(this.lowpass.frequency);

        this.lowTricord.connect(this.lowpass);
        this.midTricord.connect(this.lowpass);
        this.highTricord.connect(this.lowpass);

        this.hammer = new HammerNode(ctx);
        this.midFrequency.connect(this.hammer.frequencyParam);

        this.output = ctx.createGain();
        this.output.gain.value = PianoNode.VOLUME;
        this.lowpass.connect(this.output);
        this.hammer.connect(this.output);
    }

    connect(destinationNode: AudioParam | AudioNode, output?: number, input?: number): PianoNode {
        if(destinationNode instanceof AudioParam) {
            this.output.connect(destinationNode, output);
        } else {
            this.output.connect(destinationNode, output, input);
        }
        return this;
    }

    schedule(note: Note): void {
        this.idealFrequency.start(note.startTime);
        this.lowpassEnvelope.schedule(note.volume, note.startTime);

        const adjustedNote = {
            ...note,
            startTime: note.startTime
        };

        const stopTime1 = this.lowTricord.schedule(adjustedNote);
        const stopTime2 = this.midTricord.schedule(adjustedNote);
        const stopTime3 = this.highTricord.schedule(adjustedNote);
        const stopTime4 = this.hammer.schedule(adjustedNote);
        const stopTime = Math.max(stopTime1, stopTime2, stopTime3, stopTime4);
        this.idealFrequency.stop(stopTime);
    }
}

class TricordNode {
    private static readonly FUNDAMENTAL_VOLUME = 0.2;
    private static readonly HARMONIC_VOLUME = 0.1;
    private static readonly FUNDAMENTAL_ENVELOPE: ENVELOPE_AHDSR = {
        attack: 0.001,
        hold: 0.01,
        decay: 2,
        sustain: 0,
        release: 0.4
    };
    private static readonly HARMONIC_ENVELOPE: ENVELOPE_AHDSR = {
        attack: 0.003,
        hold: 0,
        decay: 1.8,
        sustain: 0,
        release: 0.2
    }

    private readonly fundamentalFrequency: ConstantSourceNode;
    readonly frequencyParam: AudioParam;

    private readonly fundamentalOscillator: OscillatorNode;
    private readonly fundamentalEnvelope: AhdsrEnvelope;

    private readonly harmonicOscillator: OscillatorNode;
    private readonly harmonicEnvelope: AhdsrEnvelope;


    constructor(ctx: BaseAudioContext) {
        this.fundamentalFrequency = ctx.createConstantSource();
        this.frequencyParam = this.fundamentalFrequency.offset;

        this.fundamentalOscillator = ctx.createOscillator();
        this.fundamentalOscillator.frequency.value = 0;
        this.fundamentalFrequency.connect(this.fundamentalOscillator.frequency);
        this.fundamentalEnvelope = new AhdsrEnvelope(ctx, TricordNode.FUNDAMENTAL_VOLUME, TricordNode.FUNDAMENTAL_ENVELOPE);
        this.fundamentalOscillator.connect(this.fundamentalEnvelope.input);

        this.harmonicOscillator = ctx.createOscillator();
        this.harmonicOscillator.frequency.value = 0;
        this.fundamentalFrequency.connect(this.harmonicOscillator.frequency)
        const real = new Float32Array(15);
        const imag = new Float32Array(15);
        real.fill(1);
        imag.fill(0);
        real[0] = 0;
        const harmonicWave = ctx.createPeriodicWave(real, imag);
        this.harmonicOscillator.setPeriodicWave(harmonicWave);
        this.harmonicEnvelope = new AhdsrEnvelope(ctx, TricordNode.HARMONIC_VOLUME, TricordNode.HARMONIC_ENVELOPE);
        this.harmonicOscillator.connect(this.harmonicEnvelope.input);
    }

    connect(destinationNode: AudioParam | AudioNode, output?: number, input?: number): TricordNode {
        if(destinationNode instanceof AudioParam) {
            this.fundamentalEnvelope.connect(destinationNode, output);
            this.harmonicEnvelope.connect(destinationNode, output);
        } else {
            this.fundamentalEnvelope.connect(destinationNode, output, input);
            this.harmonicEnvelope.connect(destinationNode, output, input);
        }
        return this;
    }

    schedule({startTime, endTime: releaseTime, volume}: Note): number {
        const fundamentalStopTime = releaseTime + AFTER_RELEASE * TricordNode.FUNDAMENTAL_ENVELOPE.release;
        this.fundamentalFrequency.start(startTime);
        this.fundamentalFrequency.stop(fundamentalStopTime);
        this.fundamentalOscillator.start(startTime);
        this.fundamentalOscillator.stop(fundamentalStopTime);
        this.fundamentalEnvelope.schedule(volume, startTime, releaseTime);

        const harmonicStopTime = releaseTime + AFTER_RELEASE * TricordNode.HARMONIC_ENVELOPE.release;
        this.harmonicOscillator.start(startTime);
        this.harmonicOscillator.stop(harmonicStopTime);
        this.harmonicEnvelope.schedule(volume,startTime, releaseTime);

        return Math.max(fundamentalStopTime, harmonicStopTime);
    }
}

class HammerNode {
    private static readonly VOLUME = 0.15;
    private static readonly ENVELOPE: ENVELOPE_AHD = {
        attack: 0,
        hold: 0.002,
        decay: 0.1,
    };
    private static readonly DETUNE = 1;

    private readonly frequency: ConstantSourceNode;
    readonly frequencyParam: AudioParam;

    private readonly oscillator: OscillatorNode;
    private readonly oscillatorFrequency: GainNode;
    private readonly envelope: AhdEnvelope;

    constructor(ctx: BaseAudioContext) {
        this.frequency = ctx.createConstantSource();
        this.frequencyParam = this.frequency.offset;

        this.oscillator = ctx.createOscillator();
        this.oscillator.type = "sawtooth";
        this.oscillator.frequency.value = 0;
        this.oscillatorFrequency = ctx.createGain();
        this.oscillatorFrequency.gain.value = HammerNode.DETUNE;
        this.oscillatorFrequency.connect(this.oscillator.frequency);
        this.frequency.connect(this.oscillatorFrequency);

        this.envelope = new AhdEnvelope(ctx, HammerNode.VOLUME, HammerNode.ENVELOPE);
        this.oscillator.connect(this.envelope.input);
    }

    connect(destinationNode: AudioParam | AudioNode, output?: number, input?: number): HammerNode {
        if(destinationNode instanceof AudioParam) {
            this.envelope.connect(destinationNode, output);
        } else {
            this.envelope.connect(destinationNode, output, input);
        }
        return this;
    }

    schedule({startTime, volume}: Note): number {
        const stopTime = startTime + HammerNode.ENVELOPE.hold + AFTER_RELEASE * HammerNode.ENVELOPE.decay;
        this.frequency.start(startTime);
        this.frequency.stop(stopTime);
        this.oscillator.start(startTime);
        this.oscillator.stop(stopTime);
        this.envelope.schedule(volume, startTime);
        return stopTime;
    }
}