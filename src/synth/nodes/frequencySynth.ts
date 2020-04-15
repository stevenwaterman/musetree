import {Instrument} from "../../constants";
import {SynthInstrument} from "./synthInstrument";
import {AudioNote, AudioNotes} from "../decoder";

export abstract class FrequencySynth<I extends Instrument> implements SynthInstrument<I>{
    protected abstract instrument: I;
    protected abstract setup(ctx: OfflineAudioContext, destination: AudioNode): void;
    protected abstract loadNote(note: AudioNote): void;

    public schedule(ctx: OfflineAudioContext, destination: AudioNode, notes: AudioNotes) {
        this.setup(ctx, destination);
        notes[this.instrument].forEach(note => this.loadNote(note));
    }
}
