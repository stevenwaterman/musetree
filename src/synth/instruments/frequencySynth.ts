import {Instrument, pitchMin} from "../../constants";
import {Note} from "../../state/notes";
import {SynthInstrument} from "./synthInstrument";

export abstract class FrequencySynth<I extends Instrument> implements SynthInstrument<I>{
    protected abstract instrument: I;
    protected abstract instantiate(ctx: OfflineAudioContext, destination: AudioNode): void;
    protected abstract loadNote(frequency: number, duration: number, startTime: number): void;

    public schedule(ctx: OfflineAudioContext, destination: AudioNode, notes: Record<I, Note[]>) {
        // const sampleRate = ctx.sampleRate;
        this.instantiate(ctx, destination);
        notes[this.instrument].forEach(note => {
            const freq: number = note.pitch - pitchMin;
            const duration: number = note.duration;
            const startTime = note.time_on;
            this.loadNote(freq, duration, startTime);
        });
    }
}
