import {Offline, Oscillator, Player, ToneAudioBuffer, Transport} from "tone";
import {Piano} from "./instruments/piano";
import {Notes} from "../state/notes";
import {Instrument} from "../constants";
import {SynthInstrument} from "./instruments/synthInstrument";
import {Bass} from "./instruments/bass";
import {Clarinet} from "./instruments/clarinet";
import {Cello} from "./instruments/cello";
import {Drums} from "./instruments/drums";
import {Guitar} from "./instruments/guitar";
import {Flute} from "./instruments/flute";
import {Harp} from "./instruments/harp";
import {Trumpet} from "./instruments/trumpet";
import {Violin} from "./instruments/violin";
import {derived, Readable, Writable, writable} from "svelte/store";
import {currentNotesStore} from "../state/trackTree";

const audioStatusStoreInternal: Writable<boolean> = writable(false);
export const audioStatusStore: Readable<boolean> = audioStatusStoreInternal;

const player = new Player().toDestination();
player.onstop = () => {
    audioStatusStoreInternal.set(false);
};

currentNotesStore.subscribe(async state => {
    stop();
    if (state !== null) {
        await load(state.notes, state.duration);
    }
});

export async function load(notes: Notes, duration: number) {
    await Offline(() => {
        const synths: Record<Instrument, SynthInstrument> = {
            bass: new Bass(),
            cello: new Cello(),
            clarinet: new Clarinet(),
            drums: new Drums(),
            flute: new Flute(),
            guitar: new Guitar(),
            harp: new Harp(),
            piano: new Piano(),
            trumpet: new Trumpet(),
            violin: new Violin()
        };
        Object.values(synths).forEach(synth => {
            synth.load(notes);
        });
        Transport.start();
    }, duration, 1)
        .then(buffer => {
            player.buffer = buffer;
            console.log("Loaded");
        });
}

export function play(time: number) {
    player.start(undefined, time);
    audioStatusStoreInternal.set(true);
}

export function stop() {
    player.stop();
}

