import {Instrument} from "../../constants";
import {NotesPlayer} from "./NotesPlayer";
import {AudioNote, AudioNotes} from "../decoder";
import {NoteSynth} from "./NoteSynth";

export abstract class InstrumentSynth<I extends Instrument> implements NotesPlayer, NoteSynth {
    protected abstract instrument: I;

    public async schedule(ctx: OfflineAudioContext, destination: AudioNode, notes: AudioNotes) {
        await this.setup(ctx, destination);
        notes[this.instrument].forEach(note => this.loadNote(note, ctx, destination));
    }

    abstract async loadNote(note: AudioNote, ctx: BaseAudioContext, destination: AudioNode): Promise<void>;
    abstract async setup(ctx: OfflineAudioContext, destination: AudioNode): Promise<void>;
}
