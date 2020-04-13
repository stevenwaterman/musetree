import {Note} from "../../state/notes";
import {Instrument} from "../../constants";

export type SynthInstrument<I extends Instrument> = {
    schedule(ctx: OfflineAudioContext, destination: AudioNode, notes: Record<I, Note[]>): void;
}