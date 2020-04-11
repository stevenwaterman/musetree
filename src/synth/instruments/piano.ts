import {PolySynth, Synth} from "tone";

export function createPiano(): PolySynth {
    const piano = new PolySynth(Synth, {
        oscillator: {
            type: "triangle"
        },
        envelope: {
            attack: 0.005,
            decay: 0.1,
            sustain: 0.3,
            release: 1
        }
    }).toDestination();
    piano.sync();
    return piano;
}