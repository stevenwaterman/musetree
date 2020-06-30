import { ProcessedNotes, ProcessedActiveNotes } from "../../bridge/postProcessor";

export interface NotesPlayer {
  schedule(ctx: BaseAudioContext, destination: AudioNode, notes: ProcessedNotes, activeNotesAtEnd: ProcessedActiveNotes): Promise<void>;
}