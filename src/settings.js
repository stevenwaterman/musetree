import { writable, derived } from "svelte/store";
import { instruments } from "./constants.js";

export const instrumentStores = instruments.reduce((acc, instrument) => {
  acc[instrument] = writable(instrument === "piano" || instrument === "drums");
  return acc;
}, {});

const instrumentsStore = derived(
  // @ts-ignore
  Object.values(instrumentStores),
  enabledArray =>
    enabledArray.reduce((acc, enabled, idx) => {
      acc[instruments[idx]] = enabled;
      return acc;
    }, {})
);

export const generationLengthStore = writable(225);

export const genreStore = writable("video");
export const temperatureStore = writable(1);
export const truncationStore = writable(27);

export const autoRequestStore = writable(false);
export const autoScrollStore = writable(true);
export const autoPlayStore = writable(true);

export const preplayStore = writable(2.5);

export const yScaleStore = writable(100);

export const configStore = derived(
  [
    generationLengthStore,
    genreStore,
    instrumentsStore,
    temperatureStore,
    truncationStore
  ],
  ([
    $generationLengthStore,
    $genreStore,
    $instrumentsStore,
    $temperatureStore,
    $truncationStore
  ]) => ({
    audioFormat: "mp3",
    encoding: "",
    generationLength: $generationLengthStore,
    genre: $genreStore,
    instrument: $instrumentsStore,
    temperature: $temperatureStore,
    truncation: $truncationStore
  })
);
