import {currentMidiStore} from "./trackTree";
import {Readable, Writable, writable} from "svelte/store";
// import MidiPlayer from 'web-midi-player';

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

// const midiPlayer = new MidiPlayer();
currentMidiStore.subscribe(async (midi: Blob | null) => {
    // await midiPlayer.stop();

    if(midi !== null) {
        // const buffer = await midi.arrayBuffer();
        // await midiPlayer.play({
        //     arrayBuffer: buffer
        // });

        // audioStatusStore.setPlaying(true);
    }
});

function pause(): void {
    // midiPlayer.pause();
    // midiPlayer.pause();
}

export const audio = {
    play: (time: number) => {
        // midiPlayer.resume();
        // midiPlayer.resume();
        // audioStatusStore.setTime(time);
        // player.seek(time);
    },
    pause,
};
