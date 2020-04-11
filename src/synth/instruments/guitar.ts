import {FrequencyInstrument} from "./frequencyInstrument";

export class Guitar extends FrequencyInstrument<"guitar"> {
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
