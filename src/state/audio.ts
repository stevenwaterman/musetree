import {currentNotesStore} from "./trackTree";
import {Readable, Writable, writable} from "svelte/store";
import {SoundController} from "../synth/soundController";
import {Notes} from "./notes";
import {Synth} from "tone";

type AudioStatus = {
    playing: boolean;
    time: number;
}

type AudioStatusStore = Pick<Readable<AudioStatus>, "subscribe"> & {
        setPlaying: (playing: boolean) => void;
    setTime: (time: number) => void;
}

const controller = new SoundController();

function createAudioStatusStore(): AudioStatusStore {
    const initialStatus: AudioStatus = {playing: false, time: 0};
    const {subscribe, update}: Writable<AudioStatus> = writable(initialStatus);
    return {
        subscribe,
        setTime: time => update(state => ({...state, time})),
        setPlaying: playing => update(state => ({...state, playing}))
    };
}

export const audioStatusStore: AudioStatusStore = createAudioStatusStore();

currentNotesStore.subscribe((notes: Notes | null) => {
    if(notes === null) {
        controller.reset();
    } else {
        controller.load(notes);
    }
});

function pause(): void {
    controller.stop();
}

export const audio = {
    play: (time: number) => {
        controller.play();
    },
    pause,
};
