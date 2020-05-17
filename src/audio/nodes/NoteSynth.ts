import {Note} from "../../state/notes";

export interface NoteSynth {
    setup(ctx: BaseAudioContext, destination: AudioNode): Promise<void>;
    loadNote(note: Note, ctx: OfflineAudioContext, destination: AudioNode): Promise<void>;
}