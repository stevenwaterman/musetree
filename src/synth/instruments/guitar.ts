import {SimpleAbstractPolySynth} from "./simpleAbstractPolySynth";

export class Guitar extends SimpleAbstractPolySynth<"guitar"> {
    protected instrument = "guitar" as const;

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
