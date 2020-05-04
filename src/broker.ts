import axios, {AxiosResponse} from "axios";
import download from "downloadjs";
import {Config} from "./state/settings";
import {NodeState, NodeStore} from "./state/trackTree";
import {createSectionStore, Section, SectionState} from "./state/section";
import {Writable} from "svelte/store";
import {createEmptyNotes, Note, Notes} from "./state/notes";
import {encodingToArray, encodingToString, MusenetEncoding} from "./state/encoding";
import {renderAudio} from "./audio/audioRender";
import {Instrument} from "./constants";

export async function request(config: Config, store: NodeStore, state: NodeState) {
    if (store.type === "root") {
        return await requestInternal(config, store, [], 0);
    }
    if (store.type === "branch" && state.type === "branch") {
        return await requestInternal(config, store, state.encoding, state.section.endsAt);
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
        .then((completions: Completion[]) => {
            const promises = completions.map((completion: Completion) => parseCompletion(completion, prevEncoding, prevDuration));
            return Promise.all(promises)
        })
        .then((sections: Section[]) =>
            sections.map((section: Section) =>
                createSectionStore(section)))
        .then((sectionStores: Writable<SectionState>[]) =>
            sectionStores.map((sectionStore: Writable<SectionState>) =>
                store.addChild(sectionStore)))
        .finally(() =>
            store.updatePendingLoad(it => it - 4))
}

type Completion = {
    encoding: string;
    totalTime: number;
    tracks: Array<{
        instrument: Instrument,
        notes: Note[]
    }>
}

async function parseCompletion(completion: Completion, prevEncoding: MusenetEncoding, prevDuration: number): Promise<Section> {
    const fullEncoding = encodingToArray(completion.encoding);
    const encoding = fullEncoding.slice(prevEncoding.length);
    const startsAt = prevDuration;
    const endsAt = completion.totalTime;
    const notes = parseNotes(completion, prevDuration);
    const audio = await renderAudio(encoding, endsAt - startsAt);
    return {encoding, startsAt, endsAt, notes, audio};
}

function transposeNotes(notes: Note[], subtract: number): Note[] {
    return notes
        .filter(note => note.time_on >= subtract)
        .filter(note => note.duration > 0)
        .map(note => ({...note, time_on: note.time_on - subtract}))
}

function parseNotes({tracks}: Completion, prevDuration: number): Notes {
    const notesPerInstrument: Notes = createEmptyNotes();

    tracks.forEach(({instrument, notes}) =>
        notesPerInstrument[instrument] = transposeNotes(notes, prevDuration)
    );

    return notesPerInstrument;
}

