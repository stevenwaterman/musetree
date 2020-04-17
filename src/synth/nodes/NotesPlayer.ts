import {Instrument} from "../../constants";
import {AudioNotes} from "../decoder";

export interface NotesPlayer {
    schedule(ctx: BaseAudioContext, destination: AudioNode, notes: AudioNotes): Promise<void>;
}