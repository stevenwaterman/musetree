import {mtof, PluckSynth} from "tone";
import {SynthInstrument} from "./synthInstrument";
import {Notes} from "../../state/notes";
import {pitchMax, pitchMin} from "../../constants";
import {MidiNote} from "tone/build/esm/core/type/NoteUnits";

export class Piano implements SynthInstrument {
    protected instrument: "piano" = "piano";
    private synths: PluckSynth[] = [];

    constructor() {
        for (let i = pitchMin; i < pitchMax; i++) {
            const newSynth = new PluckSynth({
                attackNoise: 1,
                dampening: 4000,
                resonance: 0.7,
                // release: 1,
            });
            newSynth.toDestination();
            newSynth.volume.value = -6;
            this.synths[i] = newSynth;
        }
    }

    load(notes: Notes): void {
        notes.piano.forEach(note => {
            this.synths[note.pitch - pitchMin].triggerAttackRelease(
                mtof(note.pitch as MidiNote),
                note.duration,
                note.time_on
            )
        })
    }
}
