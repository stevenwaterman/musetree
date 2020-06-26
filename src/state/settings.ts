import { derived, Readable, Writable, writable } from "svelte/store";
import { Genre, instrumentCategories, InstrumentCategory } from "../constants";
import { MusenetEncoding } from "./encoding";

export const instrumentStores: Record<InstrumentCategory, Writable<boolean>> = instrumentCategories
  .reduce((acc, instrument) => {
    acc[instrument] = writable(instrument === "piano" || instrument === "drums");
    return acc;
  }, {} as Record<InstrumentCategory, Writable<boolean>>);

const instrumentStoreValues: Readable<boolean>[] = Object.values(instrumentStores);

const instrumentsStore = derived<[Readable<boolean>, ...Readable<boolean>[]], Record<InstrumentCategory, boolean>>(
  instrumentStoreValues as [Readable<boolean>, ...Readable<boolean>[]],
  (enabledArray: [boolean, ...boolean[]]) =>
    enabledArray.reduce((acc, enabled, idx) => {
      acc[instrumentCategories[idx]] = enabled;
      return acc;
    }, {} as Record<InstrumentCategory, boolean>)
);

export const generationLengthStore: Writable<number> = writable(300);
export const maxResponseLengthStore: Writable<number> = writable(1500);
export const maxRequestLengthStore: Readable<number> = derived([generationLengthStore, maxResponseLengthStore], ([$generationLengthStore, $maxResponseLengthStore]) => $maxResponseLengthStore - $generationLengthStore);

export const genreStore: Writable<[string, Genre]> = writable(["Chopin", "chopin"]);
export const temperatureStore: Writable<number> = writable(1);
export const truncationStore: Writable<number> = writable(27);

export const autoRequestStore: Writable<boolean> = writable(false);
export const autoScrollStore: Writable<boolean> = writable(true);
export const isScrollingStore: Writable<boolean> = writable(false);
export const autoPlayStore: Writable<boolean> = writable(true);

export const preplayStore: Writable<number> = writable(2.5);

export const yScaleStore: Writable<number> = writable(100);
export const splitStore: Writable<number> = writable(50);
export const showSidebarStore: Writable<boolean> = writable(true);

export type Config = {
  encoding: MusenetEncoding,
  generationLength: number,
  requestLength: number,
  genre: Genre,
  instrument: Record<InstrumentCategory, boolean>,
  temperature: number,
  truncation: number
}

export const configStore: Readable<Config> = derived(
  [
    generationLengthStore,
    maxRequestLengthStore,
    genreStore,
    instrumentsStore,
    temperatureStore,
    truncationStore
  ],
  ([
    $generationLengthStore,
    $maxRequestLengthStore,
    $genreStore,
    $instrumentsStore,
    $temperatureStore,
    $truncationStore
  ]) => ({
    audioFormat: "mp3",
    encoding: [],
    generationLength: $generationLengthStore,
    requestLength: $maxRequestLengthStore,
    genre: $genreStore[1],
    instrument: $instrumentsStore,
    temperature: $temperatureStore,
    truncation: $truncationStore
  })
);
