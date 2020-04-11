import axios, {AxiosResponse} from "axios";
import {InstrumentCategory, instruments} from "./constants";
import download from "downloadjs";
import {Config} from "./state/settings";
import {
    NodeState,
    NodeStore
} from "./state/trackTree";
import {createTrackStore, Track, TrackState} from "./state/track";
import {Writable} from "svelte/store";
import {createEmptyNotes, Note, Notes} from "./state/notes";
import {MusenetEncoding} from "./state/encoding";



export type AudioFormat = "ogg" | "wav" | "mp3" | "midi";

export async function downloadAudio(encoding: MusenetEncoding, format: AudioFormat, name: string): Promise<XMLHttpRequest | boolean> {
    // Use fetch because `.blob` is great
    return fetch("https://musenet.openai.com/audio", {
        method: "POST",
        body: JSON.stringify({
            audioFormat: format,
            encoding
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => res.blob())
        .then(blob => download(blob, `${name}.${format}`));
}

function encodingToString(encoding: MusenetEncoding): string {
    return encoding.map(it => it.toString()).join(" ");
}

function encodingToArray(encoding: string): MusenetEncoding {
    return encoding.split(" ").map(it => parseInt(it));
}

export async function request(config: Config, store: NodeStore, state: NodeState) {
    if (store.type === "root") {
        return await requestInternal(config, store, [], 0);
    }
    if (store.type === "branch" && state.type === "branch") {
        return await requestInternal(config, store, state.encoding, state.track.endsAt);
    }
    throw new Error("Unrecognised combination of store and state types " + store.type + "/" + state.type);
}

async function requestInternal(config: Config, store: NodeStore, prevEncoding: MusenetEncoding, prevDuration: number) {
    const data = {
        ...config,
        encoding: encodingToString(prevEncoding),
        audioFormat: ""
    };

    type ResponseData = {
        completions: Completion[]
    };

    store.updatePendingLoad(it => it + 4);

    return axios({
        method: "POST",
        url: "https://musenet.openai.com/sample",
        data
    })
        .then((res: AxiosResponse<ResponseData>) =>
            res.data.completions)
        .then((completions: Completion[]) =>
            completions.map((completion: Completion) =>
                parseCompletion(completion, prevDuration)))
        .then((tracks: Track[]) =>
            tracks.map((track: Track) =>
                    createTrackStore(track)))
        .then((trackStores: Writable<TrackState>[]) =>
            trackStores.map((trackStore: Writable<TrackState>) =>
                store.addChild(trackStore)))
        .finally(() =>
            store.updatePendingLoad(it => it - 4))
}

type Completion = {
    encoding: string;
    totalTime: number;
    tracks: Array<{
        instrument: InstrumentCategory,
        notes: Note[]
    }>
}



function parseCompletion(completion: Completion, prevDuration: number): Track {
    return {
        encoding: encodingToArray(completion.encoding),
        startsAt: prevDuration,
        endsAt: completion.totalTime,
        notes: parseNotes(completion, prevDuration),
    };
}



function transposeNotes(notes: Note[], subtract: number): Note[] {
    return notes
        .map(note => ({...note, time_on: note.time_on - subtract}))
        .filter(note => note.time_on >= 0);
}

function parseNotes({tracks}: Completion, prevDuration: number): Notes {
    const notesPerInstrument: Notes = createEmptyNotes();
    instruments.forEach(instrument => (notesPerInstrument[instrument] = []));

    tracks.forEach(({instrument, notes}) =>
        (notesPerInstrument[instrument] = transposeNotes(notes, prevDuration))
    );

    return notesPerInstrument;
}

