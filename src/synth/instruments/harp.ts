import {SimpleAbstractPolySynth} from "./simpleAbstractPolySynth";

export class Harp extends SimpleAbstractPolySynth<"harp"> {
    protected instrument = "harp" as const;

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
