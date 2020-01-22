import { selectedTrackAudioStore } from "./trackTree.js";
import {writable} from "svelte/store";
import { yScaleStore } from "../settings.js";

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
  audioStatusStore.setPlaying(false);
  htmlAudio.pause();
  if (track === "") return;
  htmlAudio.src = track;
});

yScaleStore.subscribe(() => {
  audioStatusStore.setPlaying(false);
  htmlAudio.pause();
});

htmlAudio.addEventListener("paused", () => audioStatusStore.setPlaying(false));

export const audio = {
  play: time => {
    audioStatusStore.setPlaying(false);
    audioStatusStore.setTime(time);
    htmlAudio.pause();
    htmlAudio.currentTime = time;
    htmlAudio.play();
    audioStatusStore.setPlaying(true);
  }
};
