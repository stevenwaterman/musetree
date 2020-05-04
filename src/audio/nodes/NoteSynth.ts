import {AudioNote} from "../decoder";

export interface NoteSynth {
    setup(ctx: BaseAudioContext, destination: AudioNode): Promise<void>;
    loadNote(note: AudioNote, ctx: OfflineAudioContext, destination: AudioNode): Promise<void>;
}