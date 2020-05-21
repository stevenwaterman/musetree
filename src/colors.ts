import {Instrument} from "./constants";

type ColorKeys = Instrument | "bgLight" | "bgDark" | "text" | "textDark" | "textEmphasis" | "border" | "buttonBg" | "buttonBgDisabled" | "nodeActive" | "nodeWarm" | "nodeInactive"
const colorLookup: Record<ColorKeys, string> = {
    bass: "#f07178",
    drums: "#c3e88d",
    guitar: "#89ddff",
    harp: "#f78c6c",
    piano: "#ffcb6b",
    violin: "#c792ea",
    cello: "#c792ea",
    flute: "#c3cee3",
    trumpet: "#c3cee3",
    clarinet: "#c3cee3",
    bgLight: "#263238",
    bgDark: "#1f292e",
    text: "#c3cee3",
    textDark: "#82b6cc",
    textEmphasis: "#314549",
    border: "#37474f",
    buttonBg: "#314147",
    buttonBgDisabled: "#273339",
    nodeActive: "#f07178",
    nodeWarm: "#f78c6c",
    nodeInactive: "#c3cee3",
};

export const modalOptions = {
    styleWindow: {
        background: colorLookup.bgDark,
        border: "1px solid " + colorLookup.border,
        color: colorLookup.textDark
    }
};

export default colorLookup;