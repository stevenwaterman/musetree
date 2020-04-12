import {PolySynth, Synth} from "tone";
import {SimpleAbstractPolySynth} from "./simpleAbstractPolySynth";

export class Flute extends SimpleAbstractPolySynth<"flute"> {
    protected instrument = "flute" as const;

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
