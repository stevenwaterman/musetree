import { CompleteNote, IncompleteNote } from "../../bridge/decoder";

export interface NoteSynth {
  setup(ctx: BaseAudioContext, destination: AudioNode): Promise<void>;
  loadNote(note: CompleteNote, ctx: OfflineAudioContext, destination: AudioNode): Promise<void>;
  loadIncompleteNote(note: IncompleteNote, ctx: OfflineAudioContext, destination: AudioNode): Promise<void>;
}