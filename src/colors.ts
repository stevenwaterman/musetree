import {Instrument} from "./constants";
import {derived, Readable, writable, Writable} from "svelte/store";
import {derivePlacementStore} from "./state/placement";

type ColorKeys =
    Instrument
    | "strings"
    | "winds"
    | "bgLight"
    | "bgDark"
    | "text"
    | "textDark"
    | "textEmphasis"
    | "border"
    | "buttonBg"
    | "buttonBgDisabled"
    | "nodePlaying"
    | "nodeActive"
    | "nodeWarm"
    | "nodeInactive"
    | "edgePlaying"
    | "edgeActive"
    | "edgeWarm"
    | "edgeInactive"
    | "pendingLoadText"
    | "loadingBarBG"
    | "loadingBarFG"
    | "loadingBarText";
const colorLookup: Record<ColorKeys, string> = {
    bass: "#f07178",
    drums: "#c3e88d",
    guitar: "#89ddff",
    harp: "#f78c6c",
    piano: "#ffcb6b",
    strings: "#c792ea",
    violin: "#c792ea",
    cello: "#c792ea",
    flute: "#c3cee3",
    trumpet: "#c3cee3",
    clarinet: "#c3cee3",
    winds: "#c3cee3",
    bgLight: "#263238",
    bgDark: "#1f292e",
    text: "#c3cee3",
    textDark: "#82b6cc",
    textEmphasis: "#314549",
    border: "#37474f",
    buttonBg: "#314147",
    buttonBgDisabled: "#273339",
    nodePlaying: "#c3e88d",
    nodeActive: "#f07178",
    nodeWarm: "#f78c6c",
    nodeInactive: "#c3cee3",
    edgePlaying: "#c3e88d",
    edgeActive: "#f07178",
    edgeWarm: "#f78c6c",
    edgeInactive: "#c3cee3",
    pendingLoadText: "#c3e88d",
    loadingBarBG: "#c3cee3",
    loadingBarFG: "#c3e88d",
    loadingBarText: "#1f292e"
};

export const modalOptions = {
    styleWindow: {
        background: colorLookup.bgDark,
        border: "1px solid " + colorLookup.border,
        color: colorLookup.textDark
    }
};

const bassVisible = writable(true);
const drumsVisible = writable(true);
const guitarVisible = writable(true);
const harpVisible = writable(true);
const pianoVisible = writable(true);
const violinVisible = writable(true);
const celloVisible = writable(true);
const fluteVisible = writable(true);
const trumpetVisible = writable(true);
const clarinetVisible = writable(true);

export const instrumentVisibility: Record<Instrument, Writable<boolean>> = {
    bass: bassVisible,
    drums: drumsVisible,
    guitar: guitarVisible,
    harp: harpVisible,
    piano: pianoVisible,
    violin: violinVisible,
    cello: celloVisible,
    flute: fluteVisible,
    trumpet: trumpetVisible,
    clarinet: clarinetVisible
}

export const allInstrumentsVisibility: Readable<Record<Instrument, boolean>> = derived(
    [bassVisible, drumsVisible, guitarVisible, harpVisible, pianoVisible, violinVisible, celloVisible, fluteVisible, trumpetVisible, clarinetVisible],
    ([$bass, $drums, $guitar, $harp, $piano, $violin, $cello, $flute, $trumpet, $clarinet]) => ({
        bass: $bass,
        drums: $drums,
        guitar: $guitar,
        harp: $harp,
        piano: $piano,
        violin: $violin,
        cello: $cello,
        flute: $flute,
        trumpet: $trumpet,
        clarinet: $clarinet
    }));

export default colorLookup;