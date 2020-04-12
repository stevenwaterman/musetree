import {mtof, OfflineContext, PolySynth, PolySynthOptions, Synth, SynthOptions, Transport} from "tone";
import {Instrument, pitchRange} from "../../constants";
import {Notes} from "../../state/notes";
import {Frequency, MidiNote, Time} from "tone/build/esm/core/type/Units";
import {RecursivePartial} from "tone/build/esm/core/util/Interface";
import {SynthInstrument} from "./synthInstrument";

export abstract class FrequencyInstrument<I extends Instrument> implements SynthInstrument{
    protected abstract instrument: I;
    private readonly synth: PolySynth;

    protected constructor(synthOptions: RecursivePartial<SynthOptions>) {
        this.synth = new PolySynth<Synth>({
            maxPolyphony: pitchRange,
            options: synthOptions,
            voice: Synth
        });
        this.synth.volume.value = -6;
        this.synth.toDestination();
    }

    public load(notes: Notes) {
        notes[this.instrument].forEach(note => {
            const freq: Frequency = mtof(note.pitch as MidiNote);
            const duration: Time = note.duration;
            const time = note.time_on;
            this.synth.triggerAttackRelease(freq, duration, time);
        });
    }
}