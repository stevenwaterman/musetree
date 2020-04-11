import {FrequencyInstrument} from "./frequencyInstrument";

export class Harp extends FrequencyInstrument<"harp"> {
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
