import {PolySynth, Synth} from "tone";
import {SimpleAbstractPolySynth} from "./simpleAbstractPolySynth";

export class Cello extends SimpleAbstractPolySynth<"cello"> {
    protected instrument = "cello" as const;

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
