import {Instrument} from "../../constants";
import {InstrumentSynth} from "./InstrumentSynth";
import {AhdsrEnvelope, ENVELOPE_AHDSR} from "./envelopes";
import {toFrequency} from "../utils";
import {AFTER_RELEASE} from "../audioRender";
import {Note} from "../../state/notes";

export abstract class FmSynth<I extends Instrument> extends InstrumentSynth<I> {
    protected abstract amplitudeGain: number;
    protected abstract amplitudeWave: OscillatorType;
    protected abstract amplitudeEnvelope: ENVELOPE_AHDSR;
    protected abstract amplitudeFrequencyMultiplier: number = 1;

    protected abstract frequencyGain: number;
    protected abstract frequencyWave: OscillatorType;
    protected abstract frequencyEnvelope: ENVELOPE_AHDSR;
    protected abstract frequencyFrequencyMultiplier: number = 1;

    async setup(){};

    async loadNote(note: Note, ctx: BaseAudioContext, destination: AudioNode) {
        const freq = toFrequency(note.pitch);

        const adjustedAmplitudeEnvelope: ENVELOPE_AHDSR = {
            attack: this.amplitudeEnvelope.attack,
            hold: this.amplitudeEnvelope.hold,
            decay: this.amplitudeEnvelope.decay,
            sustain: this.amplitudeEnvelope.sustain,
            release: this.amplitudeEnvelope.release
        };

        const ampOsc = ctx.createOscillator();
        ampOsc.type = this.amplitudeWave;
        ampOsc.frequency.value = freq * this.amplitudeFrequencyMultiplier ;
        ampOsc.start(note.startTime);
        ampOsc.stop(note.endTime + AFTER_RELEASE * this.amplitudeEnvelope.release);

        const ampGain = new AhdsrEnvelope(
            ctx,
            this.amplitudeGain,
            adjustedAmplitudeEnvelope,
        );
        ampOsc.connect(ampGain.input);
        ampGain.connect(destination);
        ampGain.schedule(note.volume, note.startTime, note.endTime);

        const adjustedFrequencyEnvelope: ENVELOPE_AHDSR = {
            attack: this.frequencyEnvelope.attack,
            hold: this.frequencyEnvelope.hold,
            decay: this.frequencyEnvelope.decay,
            sustain: this.frequencyEnvelope.sustain,
            release: this.frequencyEnvelope.release
        };

        const freqOsc = ctx.createOscillator();
        freqOsc.type = this.frequencyWave;
        freqOsc.frequency.value = freq * this.frequencyFrequencyMultiplier;
        freqOsc.start(note.startTime);
        freqOsc.stop(note.endTime + AFTER_RELEASE * this.frequencyEnvelope.release);

        const freqGain = new AhdsrEnvelope(
            ctx,
            this.frequencyGain,
            adjustedFrequencyEnvelope
        );
        freqOsc.connect(freqGain.input);
        freqGain.connect(ampOsc.frequency);
        freqGain.schedule(1, note.startTime, note.endTime);


    }
}