import {FmSynth} from "../nodes/FmSynth";
import {ENVELOPE_AHDSR} from "../nodes/envelopes";

export class Trumpet extends FmSynth<"trumpet"> {
    protected instrument = "trumpet" as const;

    protected amplitudeEnvelope: ENVELOPE_AHDSR = {
        attack: 0.01,
        hold: 0.01,
        decay: 1,
        sustain: 0.6,
        release: 0.04
    };
    protected amplitudeGain: number = 0.2;
    protected amplitudeWave: OscillatorType = "square";
    protected amplitudePitchAdjustment: number | null = null;
    protected amplitudeFrequencyMultiplier: number = 1;


    protected frequencyEnvelope: ENVELOPE_AHDSR = {
        attack: 0.001,
        hold: 0.01,
        decay: 0.1,
        sustain: 4,
        release: 0.05
    };
    protected frequencyGain: number = 1;
    protected frequencyWave: OscillatorType = "sine";
    protected frequencyPitchAdjustment: number | null = null;
    protected frequencyFrequencyMultiplier: number = 1;


    protected offDelay: number = 0.25;
}
