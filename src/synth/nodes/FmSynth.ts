import {Instrument} from "../../constants";
import {InstrumentSynth} from "./InstrumentSynth";
import {AudioNote} from "../decoder";
import {AhdsrEnvelope, ENVELOPE_AHDSR} from "./envelopes";
import {toFrequency} from "../utils";

export abstract class FmSynth<I extends Instrument> extends InstrumentSynth<I> {
    protected abstract amplitudeGain: number;
    protected abstract amplitudeWave: OscillatorType;
    protected abstract amplitudeEnvelope: ENVELOPE_AHDSR;
    protected abstract amplitudeFrequencyMultiplier: number = 1;
    protected abstract amplitudePitchAdjustment: number | null = null;

    protected abstract frequencyGain: number;
    protected abstract frequencyWave: OscillatorType;
    protected abstract frequencyEnvelope: ENVELOPE_AHDSR;
    protected abstract frequencyFrequencyMultiplier: number = 1;
    protected abstract frequencyPitchAdjustment: number | null = null;

    protected abstract offDelay: number;

    async setup(){};

    async loadNote(note: AudioNote, ctx: BaseAudioContext, destination: AudioNode) {
        const freq = toFrequency(note.pitch);



        const ampMultiplier = this.amplitudePitchAdjustment === null ? 1 : Math.pow(2, (note.pitch - 60)/this.amplitudePitchAdjustment);
        const adjustedAmplitudeEnvelope: ENVELOPE_AHDSR = {
            attack: this.amplitudeEnvelope.attack * ampMultiplier,
            hold: this.amplitudeEnvelope.hold * ampMultiplier,
            decay: this.amplitudeEnvelope.decay * ampMultiplier,
            sustain: this.amplitudeEnvelope.sustain,
            release: this.amplitudeEnvelope.release * ampMultiplier
        };

        const ampOsc = ctx.createOscillator();
        ampOsc.type = this.amplitudeWave;
        ampOsc.frequency.value = freq * this.amplitudeFrequencyMultiplier * ampMultiplier;
        ampOsc.start(note.startTime);
        ampOsc.stop(note.endTime + this.offDelay);

        const ampGain = new AhdsrEnvelope(
            ctx,
            this.amplitudeGain * ampMultiplier * note.volume,
            adjustedAmplitudeEnvelope,
            ampOsc
        );
        ampGain.connect(destination);
        ampGain.schedule(note.volume, note.startTime, note.endTime);

        const freqMultiplier = this.frequencyPitchAdjustment === null ? 1 : Math.pow(2, (note.pitch - 60)/this.frequencyPitchAdjustment);
        const adjustedFrequencyEnvelope: ENVELOPE_AHDSR = {
            attack: this.frequencyEnvelope.attack * freqMultiplier,
            hold: this.frequencyEnvelope.hold * freqMultiplier,
            decay: this.frequencyEnvelope.decay * freqMultiplier,
            sustain: this.frequencyEnvelope.sustain,
            release: this.frequencyEnvelope.release * freqMultiplier
        };

        const freqOsc = ctx.createOscillator();
        freqOsc.type = this.frequencyWave;
        freqOsc.frequency.value = freq * this.frequencyFrequencyMultiplier * freqMultiplier;
        freqOsc.start(note.startTime);
        freqOsc.stop(note.endTime + this.offDelay);

        const freqGain = new AhdsrEnvelope(
            ctx,
            this.frequencyGain * freqMultiplier,
            adjustedFrequencyEnvelope,
            freqOsc
        );
        freqGain.connect(ampOsc.frequency);


    }
}