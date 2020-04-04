import axios from "axios";
import * as rax from "retry-axios";
import {instrumentCategories, InstrumentCategory} from "./constants";
import download from "downloadjs";
import {Config} from "./state/settings";

export type MusenetEncoding = number[]
export type AudioFormat = "ogg" | "wav" | "mp3" | "midi";

rax.attach();

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

export async function request(config: Config, prevEncoding: MusenetEncoding, prevDuration: number) {
    const data = {
        ...config,
        encoding: encodingToString(prevEncoding),
        audioFormat: ""
    };

    // @ts-ignore
    return axios({
        method: "POST",
        url: "https://musenet.openai.com/sample",
        data,
        // raxConfig: {
        //     retry: 3,
        //     noResponseRetries: 2,
        //     retryDelay: 0,
        //     backoffType: "static",
        //     onRetryAttempt: async err => {
        //         console.warn("retrying:", err);
        //     }
        // }
    }).then(res =>
        res.data.completions.map((completion: Completion) => parseCompletion(completion, prevDuration))
    );
}

type Completion = {
    encoding: string;
    totalTime: number;
    tracks: Array<{
        instrument: InstrumentCategory,
        notes: Note[]
    }>
}

export type Track = {
    encoding: MusenetEncoding;
    startsAt: number;
    endsAt: number;
    notes: Record<InstrumentCategory, Note[]>;
}

function parseCompletion(completion: Completion, prevDuration: number): Track {
    return {
        encoding: encodingToArray(completion.encoding),
        startsAt: prevDuration,
        endsAt: completion.totalTime,
        notes: parseNotes(completion, prevDuration),
    };
}

export type Note = {
    time_on: number;
    pitch: number;
    duration: number;
}

function transposeNotes(notes: Note[], subtract: number): Note[] {
    return notes
        .map(note => ({...note, time_on: note.time_on - subtract}))
        .filter(note => note.time_on >= 0);
}

function parseNotes({tracks}: Completion, prevDuration: number): Record<InstrumentCategory, Note[]> {
    const notesPerInstrument: Record<InstrumentCategory, Note[]> = {} as Record<InstrumentCategory, Note[]>;
    instrumentCategories.forEach(instrument => (notesPerInstrument[instrument] = []));

    console.log(prevDuration);
    tracks.forEach(({instrument, notes}) => console.log(instrument, notes));
    tracks.forEach(({instrument, notes}) =>
            (notesPerInstrument[instrument] = transposeNotes(notes, prevDuration))
    );
    console.log(notesPerInstrument);

    return notesPerInstrument;
}

