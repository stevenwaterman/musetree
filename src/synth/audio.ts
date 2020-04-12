import {now, Offline, Player, Transport} from "tone";
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
import {Writable, writable} from "svelte/store";
import {currentNotesStore} from "../state/trackTree";

type AudioStatus_Base<TYPE extends string> = {
    type: TYPE;
}
type AudioStatus_Empty = AudioStatus_Base<"empty">;
type AudioStatus_Loading = AudioStatus_Base<"loading">;
type AudioStatus_Ready = AudioStatus_Base<"ready"> & {
    trackDuration: number;
};
type AudioStatus_Playing = AudioStatus_Base<"playing"> & {
    started: number;
    offset: number;
    trackDuration: number;
};

type AudioStatus = AudioStatus_Empty | AudioStatus_Loading | AudioStatus_Ready | AudioStatus_Playing;

const audioStatusStoreInternal: Writable<AudioStatus> = writable({type: "empty"});
export const audioStatusStore = audioStatusStoreInternal;

let audioStatus: AudioStatus = {type: "empty"};
audioStatusStore.subscribe(newStatus => {
    audioStatus = newStatus;
});

const player = new Player().toDestination();

currentNotesStore.subscribe(async state => {
    stop();
    if (state !== null) {
        await load(state.notes, state.duration);
    } else {
        audioStatusStoreInternal.set({type: "empty"});
    }
});

export async function load(notes: Notes, duration: number) {
    if (audioStatus.type === "playing") {
        throw new Error("Audio should not be playing, it will break");
    }

    audioStatusStoreInternal.set({type: "loading"});

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
        })
        .then(() => {
            audioStatusStoreInternal.set({type: "ready", trackDuration: duration})
        })
        .catch((e) => {
            console.error(e);
            audioStatusStoreInternal.set({type: "empty"})
        })
}

export function play(time: number) {
    if(audioStatus.type === "empty" || audioStatus.type === "loading") {
        throw new Error("Cannot play - Invalid status " + audioStatus.type);
    }

    if(audioStatus.type === "playing") {
        stop();
    }

    player.start(undefined, time);

    const duration = audioStatus.trackDuration;
    const startedTime = now();
    audioStatusStoreInternal.set({
        type: "playing",
        trackDuration: duration,
        offset: time,
        started: startedTime
    });

    setTimeout(() => {
        if(audioStatus.type === "playing" && audioStatus.started === startedTime){
            audioStatusStoreInternal.set({type: "ready", trackDuration: duration})
        }
    }, 1000 * (duration - time))
}

export function stop() {
    if (audioStatus.type === "playing") {
        audioStatusStoreInternal.set({type: "ready", trackDuration: audioStatus.trackDuration});
        player.stop();
    }
}

