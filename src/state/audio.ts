import {currentMidiStore} from "./trackTree";
import {Readable, Writable, writable} from "svelte/store";

type AudioStatus = {
    playing: boolean;
    time: number;
}

type AudioStatusStore = Pick<Readable<AudioStatus>, "subscribe"> & {
    setPlaying: (playing: boolean) => void;
    setTime: (time: number) => void;
}

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

const htmlAudio: HTMLAudioElement = new Audio();
currentMidiStore.subscribe((midi: Blob | null) => {
    pause();
    console.log(midi);
    htmlAudio.srcObject = midi;
});

function pause(): void {
    audioStatusStore.setPlaying(false);
    htmlAudio.pause();
}

htmlAudio.onplaying = () => audioStatusStore.setPlaying(true);
htmlAudio.onended = () => audioStatusStore.setPlaying(false);

export const audio = {
    play: async (time: number) => {
        audioStatusStore.setTime(time);
        pause();
        htmlAudio.currentTime = time;
        await htmlAudio.play();
    },
    pause,
};
