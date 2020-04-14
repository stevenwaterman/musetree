import {Merge, mtof} from "tone";
import {Instrument, pitchMax, pitchMin, pitchRange} from "../../constants";
import {FrequencySynth} from "./frequencySynth";
import {MidiNote} from "tone/build/esm/core/type/NoteUnits";
import {AudioNote} from "../decoder";

export abstract class SimpleAbstractPolySynth<I extends Instrument> extends FrequencySynth<I>{
    private creator: (note: AudioNote) => void = null as any;

    protected instantiate(ctx: OfflineAudioContext, destination: AudioNode) {
        const outputGainNode = ctx.createGain();
        outputGainNode.gain.value = 0.2;
        outputGainNode.connect(destination);

        this.creator = (note) => {
            const gainNode = ctx.createGain();
            gainNode.connect(outputGainNode);
            // gainNode.gain.setValueAtTime(0, note.startTime);

            const oscillatorNode = ctx.createOscillator();
            oscillatorNode.connect(gainNode);
            oscillatorNode.frequency.value = mtof(note.pitch as MidiNote);
            oscillatorNode.start(note.startTime);
            oscillatorNode.stop(note.endTime);
        };
    }

    protected loadNote(note: AudioNote): void {
        this.creator(note);
    }
}
