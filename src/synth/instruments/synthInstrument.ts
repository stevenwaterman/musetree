import {Notes} from "../../state/notes";

export interface SynthInstrument {
    load(notes: Notes): void;
}