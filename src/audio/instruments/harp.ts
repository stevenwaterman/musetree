import {FmSynth} from "../nodes/FmSynth";
import {ENVELOPE_AHDSR} from "../nodes/envelopes";

export class Harp extends FmSynth<"harp"> {
    protected instrument = "harp" as const;

    protected amplitudeEnvelope: ENVELOPE_AHDSR = {
        attack: 0.001,
        hold: 0.01,
        decay: 0.5,
        sustain: 0,
        release: 0.5
    };
    protected amplitudeGain: number = 0.3;
    protected amplitudeWave: OscillatorType = "sine";
    protected amplitudePitchAdjustment: number | null = null;
    protected amplitudeFrequencyMultiplier: number = 1;


    protected frequencyEnvelope: ENVELOPE_AHDSR = {
        attack: 0.001,
        hold: 0.01,
        decay: 1,
        sustain: 0,
        release: 1
    };
    protected frequencyGain: number = 7;
    protected frequencyWave: OscillatorType = "sine";
    protected frequencyPitchAdjustment: number | null = null;
    protected frequencyFrequencyMultiplier: number = 2;


    protected offDelay: number = 0.25;
}
