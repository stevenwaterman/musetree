import axios from "axios";
import {configStore} from "./settings.js";
import {instruments} from "./constants.js";
import {selectedTrackEncodingStore} from "./selectedTrack.js";

export async function request(params){
	return axios.post("https://musenet.openai.com/sample", params)
	.then(res => res.data)
	.then(data => data.completions)
	.then(tracks => tracks.map(parseTrack));
}

function parseTrack(track){
	const {encoding, totalTime} = track;
	return {
		musenetEncoding: encoding,
		notes: parseNotes(track),
		length: totalTime,
		audio: parseAudio(track)
	};
};

function parseNotes({tracks}){
	const notesPerInstrument = {};
	instruments.forEach(instrument => notesPerInstrument[instrument] = []);
	tracks.forEach(({instrument, notes}) => notesPerInstrument[instrument] = notes);
	return notesPerInstrument;
};

function parseAudio({audioFile}){
	const trimmed = audioFile.substring(2, audioFile.length - 1);
	return "data:audio/mp3;base64," + trimmed;
};
