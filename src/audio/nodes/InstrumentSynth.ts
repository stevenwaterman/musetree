import { Instrument } from "../../constants";
import { NotesPlayer } from "./NotesPlayer";
import { NoteSynth } from "./NoteSynth";
import { ProcessedNotes, ProcessedActiveNotes } from "../../bridge/postProcessor";
import { CompleteNote, IncompleteNote } from "../../bridge/decoder";

export abstract class InstrumentSynth<I extends Instrument> implements NotesPlayer, NoteSynth {
  protected abstract instrument: I;

  public async schedule(ctx: BaseAudioContext, destination: AudioNode, notes: ProcessedNotes, activeAtEnd: ProcessedActiveNotes) {
    await this.setup(ctx, destination);
    notes[this.instrument].forEach(note => this.loadNote(note, ctx, destination));
    Object.values(activeAtEnd[this.instrument]).forEach(note => this.loadIncompleteNote(note, ctx, destination));
  }

  abstract async loadNote(note: CompleteNote, ctx: BaseAudioContext, destination: AudioNode): Promise<void>;
  abstract async loadIncompleteNote(note: IncompleteNote, ctx: BaseAudioContext, destination: AudioNode): Promise<void>;
  abstract async setup(ctx: BaseAudioContext, destination: AudioNode): Promise<void>;
}
