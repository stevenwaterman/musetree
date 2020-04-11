import {Transport} from "tone";
import {Piano} from "./instruments/piano";
import {Notes} from "../state/notes";
import {FrequencyInstrument} from "./instruments/frequencyInstrument";
import {Instrument} from "../constants";
import {SynthInstrument} from "./instruments/synthInstrument";
import {Bass} from "./instruments/bass";
import {Clarinet} from "./instruments/clarinet";
import {Cello} from "./instruments/cello";
import {Drums} from "./instruments/drums";
import {Guitar} from "./instruments/guitar";
import {Flute} from "./instruments/flute";
import {Harp} from "./instruments/harp";
import {Trumpet} from "./instruments/trumpet";
import {Violin} from "./instruments/violin";

export class SoundController {
    private readonly instruments: SynthInstrument[];
    private state: "waiting" | "ready" | "playing" = "waiting";

    constructor() {
        const instrumentRecord: Record<Instrument, SynthInstrument> = {
            bass: new Bass(),
            cello: new Cello(),
            clarinet: new Clarinet(),
            drums: new Drums(),
            flute: new Flute(),
            guitar: new Guitar(),
            harp: new Harp(),
            piano: new Piano(),
            trumpet: new Trumpet(),
            violin: new Violin()
        };
        this.instruments = Object.values(instrumentRecord);
    }

    load(notes: Notes) {
        if(this.state === "playing") {
            this.stop();
        }
        if(this.state === "waiting" || this.state === "ready") {
            this.reset();
            this.instruments.forEach(instrument => instrument.load(notes));
            this.state = "ready";
        }
    }

    reset() {
        if(this.state === "ready"){
            Transport.cancel();
            this.instruments.forEach(instrument => instrument.stop());
            this.state = "waiting";
        }
    }

    play(time: number) {
        if(this.state === "ready") {
            Transport.start(time);
            this.state = "playing";
        }
    }

    stop() {
        if(this.state === "playing") {
            Transport.stop();
            this.state = "ready";
        }
    }
}

