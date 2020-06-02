import {Readable, Writable, writable} from "svelte/store";
import {Section} from "../state/section";
import {
    BranchState,
    BranchStore,
    NodeState,
    root,
} from "../state/trackTree";
import {autoPlayStore, preplayStore} from "../state/settings";
import {combineSections} from "./audioCombiner";

type AudioStatus_Base<TYPE extends string> = {
    type: TYPE;
}
type AudioStatus_Off = AudioStatus_Base<"off"> & {};
type AudioStatus_Loading = AudioStatus_Base<"loading"> & {};
type AudioStatus_Starting = AudioStatus_Base<"starting"> & {};
type AudioStatus_On = AudioStatus_Base<"on"> & {
    started: number;
    offset: number;
    duration: number;
};
type AudioStatus = AudioStatus_Off | AudioStatus_Loading | AudioStatus_Starting | AudioStatus_On;

const audioStatusStoreInternal: Writable<AudioStatus> = writable({type: "off"});
export const audioStatusStore = audioStatusStoreInternal;

let audioStatus: AudioStatus = {type: "off"};
audioStatusStore.subscribe(newStatus => {
    audioStatus = newStatus;
});

const ctx = new AudioContext({
    sampleRate: 44100
});

let autoPlay: boolean = false;
let prePlayTime: number = 0;
autoPlayStore.subscribe(state => autoPlay = state);
preplayStore.subscribe(state => prePlayTime = state);

type TrackAudio = {
    buffer: AudioBuffer,
    duration: number
}
let trackAudio: TrackAudio | null = null;

root.selectedSectionsStore.subscribe(load);
async function load(track: Section[] | null) {
    stop();

    if(track === null || track.length === 0) return;

    audioStatusStore.set({type: "loading"});
    const buffer = await combineSections(track);
    const duration = track[track.length - 1].endsAt;
    trackAudio = {buffer, duration};

    if(autoPlay) {
        const offset = track[track.length -1].startsAt - prePlayTime;
        const clamped = Math.max(offset, 0);
        await play(clamped);
    }
}

let source: AudioBufferSourceNode | null = null;
export async function play(offset: number) {
    if(trackAudio === null) return;
    if (audioStatus.type === "on") stop();
    audioStatusStoreInternal.set({ type: "starting" })

    source = ctx.createBufferSource();
    source.buffer = trackAudio.buffer;
    source.connect(ctx.destination);
    source.onended = stop;
    source.start(undefined, offset);

    audioStatusStoreInternal.set({
        type: "on",
        started: ctx.currentTime,
        offset: offset,
        duration: trackAudio.duration
    });
}

export function stop() {
    if(!source) return;
    source.onended = () => {};
    source.stop();
    source = null;
    audioStatusStoreInternal.set({type: "off"})
}

export function togglePlayback() {
    if(audioStatus.type === "off") {
        play(0);
    } else if(audioStatus.type === "on") {
        stop();
    }
}