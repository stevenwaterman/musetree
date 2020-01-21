import axios from "axios";
import {instruments} from "./constants.js";

export async function request(config, prevEncoding, prevDuration){
	const params = {
		...config,
		encoding: prevEncoding
	}

	return axios.post("https://musenet.openai.com/sample", params)
	.then(res => res.data)
	.then(data => data.completions)
	.then(tracks => tracks.map(track => parseTrack(track, prevDuration)));
}

function parseTrack(track, prevDuration){
	const {totalTime: newDuration} = track;
	const sectionDuration = newDuration - prevDuration;

	const output = {
		encoding: track.encoding,
		sectionDuration,
		duration: newDuration,
		notes: parseNotes(track, prevDuration),
		audio: parseAudio(track)
	};
	return output;
};

function transposeNotes(notes, subtract){
	return notes.map(note => ({...note, time_on: note.time_on - subtract})).filter(note => note.time_on >= 0);
}

function parseNotes({tracks}, prevDuration){
	const notesPerInstrument = {};
	instruments.forEach(instrument => notesPerInstrument[instrument] = []);
	tracks.forEach(({instrument, notes}) => notesPerInstrument[instrument] = transposeNotes(notes, prevDuration));
	return notesPerInstrument;
};

function parseAudio({audioFile}){
	const trimmed = audioFile.substring(2, audioFile.length - 1);
	return "data:audio/mp3;base64," + trimmed;
};
