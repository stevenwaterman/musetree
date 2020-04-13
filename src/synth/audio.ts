import {now, Player, ToneAudioBuffer} from "tone";
import {Piano} from "./instruments/piano";
import {Notes} from "../state/notes";
import {Instrument} from "../constants";
import {SynthInstrument} from "./instruments/synthInstrument";
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
    if (state !== null) {
        await load(state.notes, state.duration);
    } else {
        reset();
    }
});

const synths: Partial<Record<Instrument, SynthInstrument<Instrument>>> = {
    piano: new Piano(),
};


const sampleRate = 48000;
async function render(notes: Notes, duration: number): Promise<AudioBuffer> {
    const ctx = new OfflineAudioContext(1, duration * sampleRate, sampleRate);
    const destination = ctx.destination;

    synths.piano?.schedule(ctx, destination, notes);

    return await ctx.startRendering();
}

export async function load(notes: Notes, duration: number) {
    if (audioStatus.type === "playing") {
        stop();
    }

    audioStatusStoreInternal.set({type: "loading"});

    const audioBuffer = await render(notes, duration);
    player.buffer = new ToneAudioBuffer(audioBuffer);

    audioStatusStoreInternal.set({type: "ready", trackDuration: duration});
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

function reset() {
    player.stop();
    audioStatusStoreInternal.set({type: "empty"});
}

