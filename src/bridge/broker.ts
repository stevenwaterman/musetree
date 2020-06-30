import axios, { AxiosResponse } from "axios";
import { Config } from "../state/settings";
import { NodeState, NodeStore } from "../state/trackTree";
import { createSectionStore, Section, SectionState } from "../state/section";
import { Writable } from "svelte/store";
import { encodingToArray, encodingToString, MusenetEncoding } from "../state/encoding";
import { render } from "../audio/audioRender";
import { decode, noProcessedActiveNotes } from "./decoder";
import { postProcess, ProcessedActiveNotes } from "./postProcessor";
import { instruments } from "../constants";

//TODO cancel all requests when loading

export async function request(config: Config, store: NodeStore, state: NodeState) {
  if (store.type === "root") {
    return await requestInternal(config, store, [], noProcessedActiveNotes(), 0, 0);
  }
  if (store.type === "branch" && state.type === "branch") {
    return await requestInternal(config, store, state.encoding, state.section.activeNotesAtEnd, state.section.startsAt, state.section.endsAt);
  }
  throw new Error("Unrecognised combination of store and state types " + store.type + "/" + state.type);
}

async function requestInternal(config: Config, store: NodeStore, prevEncoding: MusenetEncoding, prevActiveNotesAtEnd: ProcessedActiveNotes, prevSectionStart: number, prevSectionEnd: number) {
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
  const promises = response.map((completion: Completion) => parseCompletion(completion, truncatedEncoding, prevActiveNotesAtEnd, prevSectionStart, prevSectionEnd));
  return Promise.all(promises)
    .then((sections: Section[]) => sections.map((section: Section) => createSectionStore(section)))
    .then((sectionStores: Writable<SectionState>[]) =>
      sectionStores.map((sectionStore: Writable<SectionState>) => store.addChild(sectionStore)))
    .finally(() => store.updatePendingLoad(it => it - 4));
}

type Completion = {
  encoding: string;
}

async function parseCompletion(completion: Completion, prevEncoding: MusenetEncoding, prevActiveNotesAtEnd: ProcessedActiveNotes, prevSectionStart: number, prevSectionEnd: number): Promise<Section> {
  const activeNotesAtStart: ProcessedActiveNotes = noProcessedActiveNotes();
  const prevSectionDuration = prevSectionEnd - prevSectionStart;
  instruments.forEach(instrument => Object.values(prevActiveNotesAtEnd[instrument]).forEach(note => {
    activeNotesAtStart[instrument][note.pitch] = {
      ...note,
      startTime: note.startTime - prevSectionDuration
    }
  }));
  const fullEncoding = encodingToArray(completion.encoding);
  const sectionEncoding = fullEncoding.slice(prevEncoding.length);
  const decoded = decode(sectionEncoding, activeNotesAtStart)
  const processed = postProcess(decoded);
  const startsAt = prevSectionEnd;
  const endsAt = startsAt + processed.duration;
  const audio = await render(processed.notes, processed.activeAtEnd, endsAt - startsAt);
  return { encoding: processed.encoding, startsAt, endsAt, notes: processed.notes, activeNotesAtEnd: processed.activeAtEnd, audio };
}
