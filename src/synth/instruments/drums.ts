import {PolySynth, Synth} from "tone";
import {SimpleAbstractPolySynth} from "./simpleAbstractPolySynth";

export class Drums extends SimpleAbstractPolySynth<"drums"> {
    protected instrument = "drums" as const;

    constructor() {
        super({
            oscillator: {
                type: "triangle"
            },
            envelope: {
                attack: 0.005,
                decay: 0.1,
                sustain: 0.3,
                release: 1
            }
        });
    }
}
