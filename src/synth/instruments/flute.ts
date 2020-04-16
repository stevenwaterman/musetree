import {FmSynth} from "../nodes/FmSynth";
import {ENVELOPE_AHDSR} from "../nodes/envelopes";

export class Flute extends FmSynth<"flute"> {
    protected instrument = "flute" as const;

    protected amplitudeEnvelope: ENVELOPE_AHDSR = {
        attack: 0.03,
        hold: 0.01,
        decay: 0.4,
        sustain: 0.4,
        release: 0.05
    };
    protected amplitudeGain: number = 0.7;
    protected amplitudeWave: OscillatorType = "sine";
    protected amplitudePitchAdjustment: number | null = null;
    protected amplitudeFrequencyMultiplier: number = 1;


    protected frequencyEnvelope: ENVELOPE_AHDSR = {
        attack: 0.001,
        hold: 0.01,
        decay: 0.4,
        sustain: 0,
        release: 0.05
    };
    protected frequencyGain: number = 4;
    protected frequencyWave: OscillatorType = "sine";
    protected frequencyPitchAdjustment: number | null = null;
    protected frequencyFrequencyMultiplier: number = 2;


    protected offDelay: number = 0.25;
}
