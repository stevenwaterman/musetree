import {Instrument} from "../../constants";
import {AudioNotes} from "../decoder";

export type SynthInstrument<I extends Instrument> = {
    schedule(ctx: OfflineAudioContext, destination: AudioNode, notes: AudioNotes): void;
}