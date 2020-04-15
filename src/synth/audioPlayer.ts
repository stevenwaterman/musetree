import {Writable, writable} from "svelte/store";
import {Section} from "../state/section";
import {BranchState, BranchStore, NodeStore, root} from "../state/trackTree";
import {get_store_value} from "svelte/internal";

type AudioStatus_Base<TYPE extends string> = {
    type: TYPE;
}
type AudioStatus_Off = AudioStatus_Base<"off"> & {
};
type AudioStatus_On = AudioStatus_Base<"on"> & {
    started: number;
    offset: number;
    duration: number;
};
type AudioStatus = AudioStatus_Off | AudioStatus_On;

const audioStatusStoreInternal: Writable<AudioStatus> = writable({type: "off"});
export const audioStatusStore = audioStatusStoreInternal;

let audioStatus: AudioStatus = {type: "off"};
audioStatusStore.subscribe(newStatus => {
    audioStatus = newStatus;
});

const ctx = new AudioContext({
    sampleRate: 48000
});
let stopFunction: () => void = () => {};
export async function play(offset: number) {
    if(audioStatus.type === "on") {
        stop();
    }

    //TODO this is filthy
    const track: Section[] = [];
    let node: NodeStore = root;
    while(true) {
        const childStore: BranchStore | null = get_store_value(node.selectedChildStore_2);
        if(childStore === null) break;
        node = childStore;

        const childState: BranchState = get_store_value(node);
        track.push(childState.section);
    }

    stopFunction = () => {};
    await ctx.suspend();
    const bufferOutput = ctx.destination;

    track.forEach(section => {
        if(section.endsAt > offset) {
            const bufferSource = ctx.createBufferSource();
            bufferSource.buffer = section.audio;
            console.log(section.audio.sampleRate);
            console.log(ctx.sampleRate);
            bufferSource.connect(bufferOutput);

            if(section.startsAt > offset) {
                const sectionStartsAt = section.startsAt - offset;
                const sectionDuration = section.endsAt - section.startsAt;
                const sectionEndsAt = sectionStartsAt + sectionDuration;
                bufferSource.start(ctx.currentTime + sectionStartsAt);
                bufferSource.stop(ctx.currentTime + sectionEndsAt);
            } else {
                const sectionStartsAt = 0;
                const sectionOffset = offset - section.startsAt;
                const sectionDuration = section.endsAt - section.startsAt - sectionOffset;
                const sectionEndsAt = sectionStartsAt + sectionDuration;
                bufferSource.start(ctx.currentTime + sectionStartsAt, sectionOffset);
                bufferSource.stop(ctx.currentTime + sectionEndsAt);
            }

            const oldStopFunction = stopFunction;
            stopFunction = () => {
                 bufferSource.stop();
                 oldStopFunction()
            }
        }
    });

    audioStatusStoreInternal.set({
        type: "on",
        started: ctx.currentTime,
        offset: offset,
        duration: track[track.length - 1].endsAt
    });

    await ctx.resume();
}

export function stop() {
    stopFunction();

    audioStatusStoreInternal.set({type: "off"})
}
