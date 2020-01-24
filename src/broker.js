import axios from "axios";
import * as rax from "retry-axios";
import { instruments } from "./constants.js";
import download from "downloadjs";

rax.attach();

export async function downloadAudio(encoding, format, name) {
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

export async function request(config, prevEncoding, prevDuration) {
  const data = {
    ...config,
    encoding: prevEncoding
  };

  // @ts-ignore
  return axios({
    method: "POST",
    url: "https://musenet.openai.com/sample",
    data,
    raxConfig: {
      retry: 3,
      noResponseRetries: 2,
      retryDelay: 0,
      backoffType: "static",
      onRetryAttempt: async err => {
        console.warn("retrying:", err);
      }
    }
  }).then(res =>
    res.data.completions.map(track => parseTrack(track, prevDuration))
  );
}

function parseTrack(track, prevDuration) {
  const { totalTime: newDuration } = track;

  const output = {
    encoding: track.encoding,
    startsAt: prevDuration,
    endsAt: newDuration,
    notes: parseNotes(track, prevDuration),
    audio: parseAudio(track)
  };
  return output;
}

function transposeNotes(notes, subtract) {
  return notes
    .map(note => ({ ...note, time_on: note.time_on - subtract }))
    .filter(note => note.time_on >= 0);
}

function parseNotes({ tracks }, prevDuration) {
  const notesPerInstrument = {};
  instruments.forEach(instrument => (notesPerInstrument[instrument] = []));
  tracks.forEach(
    ({ instrument, notes }) =>
      (notesPerInstrument[instrument] = transposeNotes(notes, prevDuration))
  );
  return notesPerInstrument;
}

function parseAudio({ audioFile }) {
  const trimmed = audioFile.substring(2, audioFile.length - 1);
  return `data:audio/mp3;base64,${trimmed}`;
}
