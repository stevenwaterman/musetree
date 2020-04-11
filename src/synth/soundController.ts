import {Synth, Transport} from "tone";
import {createPiano} from "./instruments/piano";
import {Frequency, Time} from "tone/build/esm/core/type/Units";
import {Notes} from "../state/notes";

export class SoundController {
    // private readonly piano: Synth;
    private state: "waiting" | "ready" | "playing" = "waiting";

    constructor() {
        // this.piano = createPiano();
    }

    load(notes: Notes) {
        if(this.state === "waiting" || this.state === "ready") {
            this.reset();
            // notes.piano.forEach(note => {
            //     const freq: Frequency = note.pitch;
            //     const duration: Time = note.duration;
            //     const time: Time = note.time_on;
            // this.piano.triggerAttackRelease(freq, duration, time);
            // })
            this.state = "ready";
        }
    }

    reset() {
        if(this.state === "ready"){
            Transport.cancel();
            this.state = "waiting";
        }
    }

    play() {
        if(this.state === "ready") {
            Transport.start();
            this.state = "playing";
        }
    }

    stop() {
        if(this.state === "playing") {
            Transport.pause();
            this.state = "ready";
        }
    }
}

