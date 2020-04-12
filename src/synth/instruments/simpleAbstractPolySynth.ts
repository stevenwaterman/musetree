import {PolySynth, Synth, SynthOptions} from "tone";
import {Instrument, pitchRange} from "../../constants";
import {RecursivePartial} from "tone/build/esm/core/util/Interface";
import {FrequencySynth} from "./frequencySynth";

export abstract class SimpleAbstractPolySynth<I extends Instrument> extends FrequencySynth<I>{
    protected synth: PolySynth;

    protected constructor(synthOptions: RecursivePartial<SynthOptions>) {
        super();
        this.synth = new PolySynth<Synth>({
            maxPolyphony: pitchRange,
            options: synthOptions,
            voice: RandomPhaseSynth
        });
        this.synth.volume.value = -20;
        this.synth.toDestination();
    }
}

class RandomPhaseSynth extends Synth {
    static getDefaults(): SynthOptions {
        const old = super.getDefaults();
        return {
            ...old,
            oscillator: {
                ...old.oscillator,
                phase: Math.random() * 360
            }
        }
    }
}