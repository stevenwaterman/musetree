import { selectedTrackAudioStore } from "./trackTree.js";

const htmlAudio = new Audio();
selectedTrackAudioStore.subscribe(track => {
  if (track === "") return;
  htmlAudio.src = track;
});

export const audio = {
  play: () => {
    htmlAudio.play();
  },
  stop: () => {
    htmlAudio.pause();
  },
  seek: time => {
    htmlAudio.currentTime = time;
  }
};
