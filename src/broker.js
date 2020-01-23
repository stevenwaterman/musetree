import axios from "axios";
import * as rax from "retry-axios";
import { instruments } from "./constants.js";

rax.attach();

export async function request(config, prevEncoding, prevDuration) {
  const data = {
    ...config,
    encoding: prevEncoding
  };

  return axios({
    method: "POST",
    url: "https://musenet.openai.com/sample",
    data,
    raxConfig: {
		retry: 3,
		noResponseRetries: 2,
		retryDelay: 0,
		backoffType: "static",
		onRetryAttempt: err => {
			console.warn("retrying:", err);
		}
	}
  })
    .then(res => res.data)
    .then(data => data.completions)
    .then(tracks => tracks.map(track => parseTrack(track, prevDuration)));
}

function parseTrack(track, prevDuration) {
  const { totalTime: newDuration } = track;
  const sectionDuration = newDuration - prevDuration;

  const output = {
    encoding: track.encoding,
    sectionDuration,
    duration: newDuration,
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
  return "data:audio/mp3;base64," + trimmed;
}
