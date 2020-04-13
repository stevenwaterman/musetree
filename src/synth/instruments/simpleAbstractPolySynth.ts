import {Merge, mtof} from "tone";
import {Instrument, pitchMax, pitchMin, pitchRange} from "../../constants";
import {FrequencySynth} from "./frequencySynth";
import {MidiNote} from "tone/build/esm/core/type/NoteUnits";
import {Tone} from "tone/build/esm/core/Tone";

export abstract class SimpleAbstractPolySynth<I extends Instrument> extends FrequencySynth<I>{
    private notes: Array<(duration: number, startTime: number) => void> = [];

    protected instantiate(ctx: OfflineAudioContext, destination: AudioNode) {
        const outputGainNode = ctx.createGain();
        outputGainNode.gain.value = 0.2;
        outputGainNode.connect(destination);

        this.notes = [];
        for(let pitch = pitchMin; pitch < pitchMax; pitch++) {
            const gainNode = ctx.createGain();
            gainNode.connect(outputGainNode);
            gainNode.gain.value = 0;

            const oscillatorNode = ctx.createOscillator();
            oscillatorNode.connect(gainNode);
            oscillatorNode.frequency.value = mtof(pitch as MidiNote);
            oscillatorNode.start();

            this.notes.push(((duration, startTime) => {
                gainNode.gain.setValueAtTime(1, ctx.currentTime + startTime);
                gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime + duration);
            }))
        }
    }

    protected loadNote(frequency: number, duration: number, startTime: number): void {
        this.notes[frequency](duration, startTime);
    }
}
