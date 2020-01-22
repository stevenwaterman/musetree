import { selectedTrackAudioStore } from "./trackTree.js";

const htmlAudio = new Audio();
selectedTrackAudioStore.subscribe(track => {
  if (track === "") return;
  htmlAudio.pause();
  htmlAudio.src = track;
});

export function addAudioStatusListener(callback){
  htmlAudio.addEventListener("playing", () => callback({startTime: htmlAudio.currentTime, playing: true}));
  htmlAudio.addEventListener("pause", () => callback({startTime: htmlAudio.currentTime, playing: false}));
}

export const audio = {
  play: time => {
    htmlAudio.pause();
    htmlAudio.currentTime = time;
    htmlAudio.play();
  }
};
