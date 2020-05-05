import {MusenetEncoding, encodingToString} from "../state/encoding";
import download from "downloadjs";
import {Section} from "../state/section";
import {combineSections} from "./audioCombiner";
import toWav from "audiobuffer-to-wav";
import {fromMusenetToMidi} from "musenet-midi/lib/toMidi";

export type AudioFormat = "ogg" | "wav" | "mp3" | "midi";

export async function downloadMuseNetAudio(encoding: MusenetEncoding, format: AudioFormat, name: string) {
    // Use fetch because `.blob` is great
    await fetch("https://musenet.openai.com/audio", {
        method: "POST",
        body: JSON.stringify({
            audioFormat: format,
            encoding: encodingToString(encoding)
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => res.blob())
        .then(blob => download(blob, `${name}.${format}`));
}

export async function downloadMuseTreeAudio(track: Section[], name: string) {
    const {buffer} = await combineSections(track);
    const wav = toWav(buffer);
    const array = new Uint8Array(wav);
    download(array, `${name}.wav`);
}

export async function downloadMidiAudio(encoding: MusenetEncoding, name: string) {
    const blob = fromMusenetToMidi(encoding);
    download(blob, `${name}.mid`);
}
