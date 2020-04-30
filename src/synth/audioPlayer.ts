import {Writable, writable} from "svelte/store";
import {Section} from "../state/section";
import {
    BranchState,
    BranchStore,
    NodeState,
    root,
    selectedPathStore
} from "../state/trackTree";
import {get_store_value} from "svelte/internal";
import {autoPlayStore, preplayStore} from "../state/settings";
import {AudioDatum, combine} from "./audioCombiner";

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

selectedPathStore.subscribe(load);
async function load(path: number[] | null) {
    console.log("Loading");

    stop();

    if(path === null) return;

    audioStatusStore.set({type: "loading"});

    let node: NodeState = get_store_value(root);
    const track: Section[] = [];
    path.forEach((childIdx: number) => {
        const childStore: BranchStore = node.children[childIdx];
        const childState: BranchState = get_store_value(childStore);
        track.push(childState.section);
        node = childState;
    });
    console.log("Sections: ", track)

    if (!track.length) {
        return;
    }

    const data: AudioDatum[] = track
        .map(section => {
            return {
                start: section.startsAt,
                end: section.endsAt,
                buffer: section.audio
            };
        });

    const buffer = await combine(data);
    const duration = data[data.length - 1].end;
    trackAudio = { buffer, duration };

    if(autoPlay) {
        const offset = data[data.length - 1].start - prePlayTime;
        const clamped = Math.max(offset, 0);
        await play(clamped);
    }
}

let source: AudioBufferSourceNode | null = null;
export async function play(offset: number) {
    console.log("playing 1");
    if(trackAudio === null) return;
    console.log("playing 2");
    if (audioStatus.type === "on") stop();
    console.log("playing 3");
    audioStatusStoreInternal.set({ type: "starting" })
    console.log("playing 4");

    source = ctx.createBufferSource();
    console.log("playing 5");
    source.buffer = trackAudio.buffer;
    console.log("playing 6");
    source.connect(ctx.destination);
    console.log("playing 7");
    source.onended = stop;
    console.log("playing 8");
    source.start(undefined, offset);
    console.log("playing 9");

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
