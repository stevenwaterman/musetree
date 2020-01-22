import { selectedTrackAudioStore } from "./trackTree.js";
import {writable} from "svelte/store";

function createAudioStatusStore(){
  const {subscribe, update} = writable({playing: false, time: 0});
  return {
    subscribe,
    setTime: time => update(state => ({ ...state, time })),
    setPlaying: playing => update(state => ({ ...state, playing }))
  };
}
export const audioStatusStore = createAudioStatusStore();

const htmlAudio = new Audio();

selectedTrackAudioStore.subscribe(track => {
  htmlAudio.pause();
  audioStatusStore.setPlaying(false);
  if (track === "") return;
  htmlAudio.src = track;
});

htmlAudio.addEventListener("paused", () => audioStatusStore.setPlaying(false));
htmlAudio.addEventListener("playing", () => audioStatusStore.setPlaying(true));

export const audio = {
  play: time => {
    audioStatusStore.setTime(time);
    audioStatusStore.setPlaying(false);
    htmlAudio.pause();
    htmlAudio.currentTime = time;
    htmlAudio.play();
  }
};
