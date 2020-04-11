import {mtof, PolySynth, PolySynthOptions, Synth, SynthOptions} from "tone";
import {Instrument, pitchRange} from "../../constants";
import {Notes} from "../../state/notes";
import {Frequency, MidiNote, Time} from "tone/build/esm/core/type/Units";
import {RecursivePartial} from "tone/build/esm/core/util/Interface";

export abstract class FrequencyInstrument<I extends Instrument> {
    protected abstract instrument: I;
    private readonly synth: PolySynth;

    protected constructor(synthOptions: RecursivePartial<SynthOptions>) {
        const options: Partial<PolySynthOptions<Synth>> = {
            maxPolyphony: pitchRange,
            options: synthOptions,
            voice: Synth
        };
        this.synth = new PolySynth<Synth>(options);
        this.synth.volume.value = -6;
        this.synth.sync();
        this.synth.toDestination();
    }

    public load(notes: Notes) {
        notes[this.instrument].forEach(note => {
            const time = note.time_on;
            const freq: Frequency = mtof(note.pitch as MidiNote);
            const duration: Time = note.duration;
            this.synth.triggerAttackRelease(freq, duration, time);
        });
    }

    public stop() {
        this.synth.releaseAll();
    }
}