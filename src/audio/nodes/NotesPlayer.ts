import { Notes } from "../../state/notes";

export interface NotesPlayer {
  schedule(ctx: BaseAudioContext, destination: AudioNode, notes: Notes): Promise<void>;
}