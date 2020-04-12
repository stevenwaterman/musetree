import {PolySynth, Synth} from "tone";
import {SimpleAbstractPolySynth} from "./simpleAbstractPolySynth";

export class Trumpet extends SimpleAbstractPolySynth<"trumpet"> {
    protected instrument = "trumpet" as const;

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
