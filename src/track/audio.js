import { selectedTrackAudioStore } from "./trackTree.js";
import { writable } from "svelte/store";
import { yScaleStore } from "../settings.js";

function createAudioStatusStore() {
  const { subscribe, update } = writable({ playing: false, time: 0 });
  return {
    subscribe,
    setTime: time => update(state => ({ ...state, time })),
    setPlaying: playing => update(state => ({ ...state, playing }))
  };
}
export const audioStatusStore = createAudioStatusStore();

const htmlAudio = new Audio();
selectedTrackAudioStore.subscribe(track => {
  pause();
  htmlAudio.src = track;
});
yScaleStore.subscribe(pause);

function pause() {
  audioStatusStore.setPlaying(false);
  htmlAudio.pause();
}

htmlAudio.onplaying = () => audioStatusStore.setPlaying(true);
htmlAudio.onended = () => audioStatusStore.setPlaying(false);

export const audio = {
  play: time => {
    audioStatusStore.setTime(time);
    pause();
    htmlAudio.currentTime = time;
    htmlAudio.play();
  },
  pause,
};
