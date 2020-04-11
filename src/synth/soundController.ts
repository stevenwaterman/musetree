import {mtof, PolySynth, Transport} from "tone";
import {createPiano} from "./instruments/piano";
import {Frequency, MidiNote, Time} from "tone/build/esm/core/type/Units";
import {Note, Notes} from "../state/notes";

export class SoundController {
    private readonly piano: PolySynth;
    private state: "waiting" | "ready" | "playing" = "waiting";

    constructor() {
        this.piano = createPiano();
    }

    load(notes: Notes) {
        if(this.state === "playing") {
            this.stop();
        }
        if(this.state === "waiting" || this.state === "ready") {
            this.reset();
            console.log("loading");
            const chords: Note[][] = notes.piano.reduce((acc: Note[][], elem: Note) => {
                if(acc.length === 0){
                    acc.push([elem]);
                } else if (acc[acc.length - 1][0].time_on === elem.time_on) {
                    acc[acc.length - 1].push(elem);
                } else {
                    acc.push([elem]);
                }
                return acc;
            }, []);
            chords.forEach((chord: Note[]) => {
                const time = chord[0].time_on;

                chord.forEach(note => {
                    const freq: Frequency = mtof(note.pitch as MidiNote);
                    console.log(freq);
                    const duration: Time = note.duration;
                    this.piano.triggerAttackRelease(freq, duration, time);
                })
            });
            this.state = "ready";
        }
    }

    reset() {
        if(this.state === "ready"){
            console.log("resetting");
            Transport.cancel();
            this.state = "waiting";
        }
    }

    play(time: number) {
        if(this.state === "ready") {
            console.log("playing");
            Transport.start(time);
            this.state = "playing";
        }
    }

    stop() {
        if(this.state === "playing") {
            console.log("Stopping");
            Transport.stop();
            this.state = "ready";
        }
    }
}

