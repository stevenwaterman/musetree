import { selectedTrackAudioStore } from "./trackTree.js";
import {writable} from "svelte/store";
import { yScaleStore } from "../settings.js";

const htmlAudio = new Audio();
selectedTrackAudioStore.subscribe(track => {
  htmlAudio.pause();
  if (track === "") return;
  htmlAudio.src = track;
});
yScaleStore.subscribe(() => {
  htmlAudio.pause();
});

function createAudioStatusStore() {
  const { subscribe, update } = writable({ playing: false, time: 0 });
  return {
    subscribe,
    setTime: time => update(state => ({ ...state, time })),
    setPlaying: playing => update(state => ({ ...state, playing }))
  };
}
export const audioStatusStore = createAudioStatusStore();
htmlAudio.onplaying = () => audioStatusStore.setPlaying(true);
htmlAudio.onpause = () => audioStatusStore.setPlaying(false);
htmlAudio.onended = () => audioStatusStore.setPlaying(false);

export const audio = {
  play: time => {
    audioStatusStore.setTime(time);
    htmlAudio.pause();
    htmlAudio.currentTime = time;
    htmlAudio.play();
  }
};
