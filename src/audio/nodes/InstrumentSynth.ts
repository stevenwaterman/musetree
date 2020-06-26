import { Instrument } from "../../constants";
import { NotesPlayer } from "./NotesPlayer";
import { NoteSynth } from "./NoteSynth";
import { Note, Notes } from "../../state/notes";

export abstract class InstrumentSynth<I extends Instrument> implements NotesPlayer, NoteSynth {
  protected abstract instrument: I;

  public async schedule(ctx: BaseAudioContext, destination: AudioNode, notes: Notes) {
    await this.setup(ctx, destination);
    notes[this.instrument].forEach(note => this.loadNote(note, ctx, destination));
  }

  abstract async loadNote(note: Note, ctx: BaseAudioContext, destination: AudioNode): Promise<void>;
  abstract async setup(ctx: BaseAudioContext, destination: AudioNode): Promise<void>;
}
