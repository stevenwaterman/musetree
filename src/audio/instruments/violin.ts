import {FmSynth} from "../nodes/FmSynth";
import {ENVELOPE_AHDSR} from "../nodes/envelopes";

export class Violin extends FmSynth<"violin"> {
    protected instrument = "violin" as const;

    protected amplitudeEnvelope: ENVELOPE_AHDSR = {
        attack: 0.1,
        hold: 0.01,
        decay: 11,
        sustain: 0,
        release: 0.05
    };
    protected amplitudeGain: number = 0.15;
    protected amplitudeWave: OscillatorType = "sawtooth";
    protected amplitudePitchAdjustment: number | null = null;
    protected amplitudeFrequencyMultiplier: number = 1;


    protected frequencyEnvelope: ENVELOPE_AHDSR = {
        attack: 0.001,
        hold: 0.01,
        decay: 11,
        sustain: 0.2,
        release: 0.05
    };
    protected frequencyGain: number = 5;
    protected frequencyWave: OscillatorType = "sine";
    protected frequencyPitchAdjustment: number | null = null;
    protected frequencyFrequencyMultiplier: number = 1;


    protected offDelay: number = 0.25;
}
