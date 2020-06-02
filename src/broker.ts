import axios, {AxiosResponse} from "axios";
import {Config} from "./state/settings";
import {NodeState, NodeStore} from "./state/trackTree";
import {createSectionStore, Section, SectionState} from "./state/section";
import {Writable} from "svelte/store";
import {encodingToArray, encodingToString, MusenetEncoding} from "./state/encoding";
import {render} from "./audio/audioRender";
import {ActiveNotes, decode, noActiveNotes} from "./audio/decoder";

//TODO cancel all requests when loading

export async function request(config: Config, store: NodeStore, state: NodeState) {
    if (store.type === "root") {
        return await requestInternal(config, store, [], noActiveNotes(), 0);
    }
    if (store.type === "branch" && state.type === "branch") {
        return await requestInternal(config, store, state.encoding, state.section.activeNotesAtEnd, state.section.endsAt);
    }
    throw new Error("Unrecognised combination of store and state types " + store.type + "/" + state.type);
}

async function requestInternal(config: Config, store: NodeStore, prevEncoding: MusenetEncoding, prevActiveNotes: ActiveNotes, prevDuration: number) {
    const truncatedEncoding = prevEncoding.slice(-config.requestLength);

    const data = {
        ...config,
        encoding: encodingToString(truncatedEncoding),
        audioFormat: "mp3"
    };

    type ResponseData = {
        completions: Completion[]
    };

    store.updatePendingLoad(it => it + 4);

    let response: Completion[] | null = null;
    while (response === null) {
        response = await axios({
            method: "POST",
            url: "https://musenet.openai.com/sample",
            data
        })
            .then((res: AxiosResponse<ResponseData>) => res.data.completions)
            .catch(() => null);
    }
    const promises = response.map((completion: Completion) => parseCompletion(completion, truncatedEncoding, prevActiveNotes, prevDuration));
    return Promise.all(promises)
        .then((sections: Section[]) => sections.map((section: Section) => createSectionStore(section)))
        .then((sectionStores: Writable<SectionState>[]) =>
            sectionStores.map((sectionStore: Writable<SectionState>) => store.addChild(sectionStore)))
        .finally(() => store.updatePendingLoad(it => it - 4));
}

type Completion = {
    encoding: string;
}

async function parseCompletion(completion: Completion, prevEncoding: MusenetEncoding, prevActiveNotes: ActiveNotes, prevDuration: number): Promise<Section> {
    const fullEncoding = encodingToArray(completion.encoding);
    const originalEncoding = fullEncoding.slice(prevEncoding.length);
    const {encoding, notes, duration, activeNotesAtEnd} = await decode(originalEncoding, prevActiveNotes);
    const startsAt = prevDuration;
    const endsAt = startsAt + duration;
    const audio = await render(notes, endsAt - startsAt);

    return {encoding, startsAt, endsAt, notes, activeNotesAtEnd, audio};
}
