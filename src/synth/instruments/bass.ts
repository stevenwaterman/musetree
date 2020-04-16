import {FmSynth} from "../nodes/FmSynth";
import {ENVELOPE_AHDSR} from "../nodes/envelopes";

export class Bass extends FmSynth<"bass"> {
    protected instrument = "bass" as const;

    protected amplitudeEnvelope: ENVELOPE_AHDSR = {
        attack: 0.001,
        hold: 0.01,
        decay: 0.3,
        sustain: 0,
        release: 0.05
    };
    protected amplitudeGain: number = 0.5;
    protected amplitudeWave: OscillatorType = "sine";
    protected amplitudePitchAdjustment: number | null = null;
    protected amplitudeFrequencyMultiplier: number = 1;


    protected frequencyEnvelope: ENVELOPE_AHDSR = {
        attack: 0.001,
        hold: 0.01,
        decay: 1,
        sustain: 1,
        release: 0.05
    };
    protected frequencyGain: number = 3;
    protected frequencyWave: OscillatorType = "sine";
    protected frequencyPitchAdjustment: number | null = null;
    protected frequencyFrequencyMultiplier: number = 3;


    protected offDelay: number = 0.25;
}
