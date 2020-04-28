import {FmSynth} from "../nodes/FmSynth";
import {ENVELOPE_AHDSR} from "../nodes/envelopes";

export class Clarinet extends FmSynth<"clarinet"> {
    protected instrument = "clarinet" as const;

    protected amplitudeEnvelope: ENVELOPE_AHDSR = {
        attack: 0.05,
        hold: 0.01,
        decay: 0.1,
        sustain: 0.8,
        release: 0.05
    };
    protected amplitudeGain: number = 0.2;
    protected amplitudeWave: OscillatorType = "square";
    protected amplitudePitchAdjustment: number | null = null;
    protected amplitudeFrequencyMultiplier: number = 1;


    protected frequencyEnvelope: ENVELOPE_AHDSR = {
        attack: 0.001,
        hold: 0.01,
        decay: 0.1,
        sustain: 1.1,
        release: 0.05
    };
    protected frequencyGain: number = 4;
    protected frequencyWave: OscillatorType = "square";
    protected frequencyPitchAdjustment: number | null = null;
    protected frequencyFrequencyMultiplier: number = 1;


    protected offDelay: number = 0.25;
}
