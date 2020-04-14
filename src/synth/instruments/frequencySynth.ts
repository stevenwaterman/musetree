import {Instrument} from "../../constants";
import {SynthInstrument} from "./synthInstrument";
import {AudioNote, AudioNotes} from "../decoder";

export abstract class FrequencySynth<I extends Instrument> implements SynthInstrument<I>{
    protected abstract instrument: I;
    protected abstract instantiate(ctx: OfflineAudioContext, destination: AudioNode): void;
    protected abstract loadNote(note: AudioNote): void;

    public schedule(ctx: OfflineAudioContext, destination: AudioNode, notes: AudioNotes) {
        this.instantiate(ctx, destination);
        notes[this.instrument].forEach(note => this.loadNote(note));
    }
}
