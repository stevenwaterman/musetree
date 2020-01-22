import {writable} from "svelte/store";

export const instrumentSettings = {
    bass: {
        color: "rgba(255, 0, 0, 1)"
    },
    drums: {
        color: "rgba(0, 255, 0, 1)"
    },
    guitar: {
        color: "rgba(0, 0, 255, 1)"
    },
    harp: {
        color: "rgba(255, 150, 0, 1)"
    },
    piano: {
        color: "rgba(0, 255, 255, 1)"
    },
    strings: {
        color: "rgba(255, 0, 255, 1)"
    },
    winds: {
        color: "rgba(255, 255, 255, 1)"
    }
}

export const instruments = Object.keys(instrumentSettings);

export const yScaleStore = writable(50);

  export const pitchMin = 20;
  const pitchMax = 110;
  const pitchRange = pitchMax - pitchMin;
  export const canvasWidth = 700;
  export const xScale = canvasWidth / pitchRange;