import {getContext, now, Player, ToneAudioBuffer} from "tone";
import {Piano} from "./instruments/piano";
import {Notes} from "../state/notes";
import {Instrument} from "../constants";
import {SynthInstrument} from "./instruments/synthInstrument";
import {Writable, writable} from "svelte/store";
// import {currentNotesStore} from "../state/trackTree";
import {Section} from "../state/section";
import {BranchState, root, TreeState} from "../state/trackTree";
import {get_store_value} from "svelte/internal";

type AudioStatus_Base<TYPE extends string> = {
    type: TYPE;
}
type AudioStatus_Empty = AudioStatus_Base<"empty">;
type AudioStatus_Loading = AudioStatus_Base<"loading">;
type AudioStatus_Ready = AudioStatus_Base<"ready"> & {
    duration: number;
};
type AudioStatus_Playing = AudioStatus_Base<"playing"> & {
    started: number;
    offset: number;
    duration: number;
};
type AudioStatus = AudioStatus_Empty | AudioStatus_Loading | AudioStatus_Ready | AudioStatus_Playing;

const audioStatusStoreInternal: Writable<AudioStatus> = writable({type: "ready", duration: 1000});
export const audioStatusStore = audioStatusStoreInternal;

// let audioStatus: AudioStatus = {type: "empty"};
// audioStatusStore.subscribe(newStatus => {
//     audioStatus = newStatus;
// });
//
// const player = new Player().toDestination();
//
// currentNotesStore.subscribe(async state => {
//     if (state !== null) {
//         await load(state.notes, state.duration);
//     } else {
//         reset();
//     }
// });
//
// const synths: Partial<Record<Instrument, SynthInstrument<Instrument>>> = {
//     piano: new Piano(),
// };
//
// const sampleRate = 48000;
export async function load(section: Section) {
    // if (audioStatus.type === "playing") {
    //     stop();
    // }
    //
    // audioStatusStoreInternal.set({type: "loading"});
    //
    // const audioBuffer = await render(notes, duration);
    // player.buffer = new ToneAudioBuffer(audioBuffer);
    //
    // audioStatusStoreInternal.set({type: "ready", duration: duration});
}

export function play(time: number) {
    const ctx = new AudioContext();
    let bufferSource = ctx.createBufferSource();
    const rootState: TreeState = get_store_value(root);
    const childStore = rootState.children[1];
    const childState: BranchState = get_store_value(childStore);
    bufferSource.buffer = childState.section.audio;
    bufferSource.connect(ctx.destination);
    bufferSource.start();
    // if(audioStatus.type === "empty" || audioStatus.type === "loading") {
    //     throw new Error("Cannot play - Invalid status " + audioStatus.type);
    // }
    //
    // if(audioStatus.type === "playing") {
    //     stop();
    // }
    //
    // player.start(undefined, time);
    //
    // const duration = audioStatus.duration;
    // const startedTime = now();
    // audioStatusStoreInternal.set({
    //     type: "playing",
    //     duration: duration,
    //     offset: time,
    //     started: startedTime
    // });
    //
    // setTimeout(() => {
    //     if(audioStatus.type === "playing" && audioStatus.started === startedTime){
    //         audioStatusStoreInternal.set({type: "ready", duration: duration})
    //     }
    // }, 1000 * (duration - time))
}

export function stop() {
    // if (audioStatus.type === "playing") {
    //     audioStatusStoreInternal.set({type: "ready", duration: audioStatus.duration});
    //     player.stop();
    // }
}

// function reset() {
//     player.stop();
//     audioStatusStoreInternal.set({type: "empty"});
// }
