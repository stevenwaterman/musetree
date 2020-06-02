import {Instrument} from "./constants";

type ColorKeys = Instrument | "strings" | "winds" | "bgLight" | "bgDark" | "text" | "textDark" | "textEmphasis" | "border" | "buttonBg" | "buttonBgDisabled" | "nodePlaying" | "nodeActive" | "nodeWarm" | "nodeInactive" | "edgeActive" | "edgeWarm" | "edgeInactive" | "pendingLoadText" | "loadingBarBG" | "loadingBarFG" | "loadingBarText";
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

export default colorLookup;