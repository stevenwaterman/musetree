import {Writable, writable} from "svelte/store";
import {Section} from "../state/section";
import {BranchState, BranchStore, NodeStore, root, selectedBranchStore} from "../state/trackTree";
import {get_store_value} from "svelte/internal";
import {autoPlayStore, preplayStore} from "../state/settings";

type AudioStatus_Base<TYPE extends string> = {
    type: TYPE;
}
type AudioStatus_Off = AudioStatus_Base<"off"> & {};
type AudioStatus_Loading = AudioStatus_Base<"loading"> & {};
type AudioStatus_On = AudioStatus_Base<"on"> & {
    started: number;
    offset: number;
    duration: number;
};
type AudioStatus = AudioStatus_Off | AudioStatus_Loading | AudioStatus_On;

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

let trackSections: {
    start: number,
    end: number,
    buffer: AudioBuffer
}[] = [];
let sourceNodes: { start: number; end: number; source: AudioBufferSourceNode }[] = [];

selectedBranchStore.subscribe(() => load());
async function load() {
    stop();

    //TODO this is filthy
    let node: NodeStore = root;
    const track: Section[] = [];
    while (true) {
        const childStore: BranchStore | null = get_store_value(node.selectedChildStore_2);
        if (childStore === null) break;
        node = childStore;

        const childState: BranchState = get_store_value(node);
        track.push(childState.section);
    }

    trackSections = track
        .map(section => {
            return {
                start: section.startsAt,
                end: section.endsAt,
                buffer: section.audio
            };
        });

    if(autoPlay && trackSections.length) {
        const offset = trackSections[trackSections.length - 1].start - prePlayTime;
        await play(Math.max(offset, 0))
    }
}

export async function play(offset: number) {
    if(trackSections.length === 0) return;

    const stopFirst = audioStatus.type === "on";

    audioStatusStoreInternal.set({
        type: "loading"
    })

    if (stopFirst) stop();

    await ctx.suspend();

    sourceNodes = trackSections.map(({buffer, start, end}) => {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        return {start, end, source};
    });

    sourceNodes
        .filter(({end}) => end > offset)
        .forEach(({start, source}) => {
            if (start <= offset) {
                const sectionOffset = offset - start;
                source.start(ctx.currentTime, sectionOffset);
            } else {
                const sectionStartsAt = start - offset;
                source.start(ctx.currentTime + sectionStartsAt);
            }
        })

    // TODO clicking to play doesn't work - race condition
    sourceNodes[trackSections.length - 1].source.onended = () => {
        stop();
    }

    await ctx.resume();

    audioStatusStoreInternal.set({
        type: "on",
        started: ctx.currentTime,
        offset: offset,
        duration: trackSections[trackSections.length - 1].end
    });
}

export function stop() {
    if(!sourceNodes) return;
    if(sourceNodes.length) {
        sourceNodes[sourceNodes.length - 1].source.onended = () => null;
    }
    sourceNodes.forEach(source => source.source.stop())
    audioStatusStoreInternal.set({type: "off"})
}
