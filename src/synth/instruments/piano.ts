import {Synth} from "tone";

export function createPiano(): Synth {
    const piano = new Synth({
        oscillator: {

        },
        envelope: {

        }
    }).toDestination();
    piano.sync();
    return piano;
}