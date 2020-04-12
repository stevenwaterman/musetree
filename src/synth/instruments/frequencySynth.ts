import {mtof, PolySynth} from "tone";
import {Instrument} from "../../constants";
import {Notes} from "../../state/notes";
import {SynthInstrument} from "./synthInstrument";
import {MidiNote} from "tone/build/esm/core/type/NoteUnits";
import {Frequency, Time} from "tone/build/esm/core/type/Units";
import {Instrument as ToneInstrument} from "tone/build/esm/instrument/Instrument";

export abstract class FrequencySynth<I extends Instrument> implements SynthInstrument{
    protected abstract instrument: I;
    protected abstract synth: ToneInstrument<any>;

    public load(notes: Notes) {
        notes[this.instrument].forEach(note => {
            const freq: Frequency = mtof(note.pitch as MidiNote);
            const duration: Time = note.duration;
            const time = note.time_on;
            this.synth.triggerAttackRelease(freq, duration, time);
        });
    }
}
