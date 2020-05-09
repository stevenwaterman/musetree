import {MusenetEncoding} from "../state/encoding";
import {Instrument} from "../constants";
import {Notes} from "../state/notes";
import {drumDuration} from "./audioRender";

export function decode(encoded: MusenetEncoding): {
    notes: Notes;
    duration: number;
} {
    const notes: Notes = {
        piano: [],
        violin: [],
        cello: [],
        bass: [],
        guitar: [],
        flute: [],
        clarinet: [],
        trumpet: [],
        harp: [],
        drums: []
    };
    const notesStarted: Record<Instrument, Record<number, { startTime: number, volume: number }>> = {
        piano: {},
        violin: {},
        cello: {},
        bass: {},
        guitar: {},
        flute: {},
        clarinet: {},
        trumpet: {},
        harp: {},
        drums: {}
    };
    let time: number = 0;

    const tokens: Token[] = encoded.map(parseToken).filter(it => it !== null) as Token[];

    for (const token of tokens) {
        if (token.type === "note") {
            const {instrument, pitch} = token;
            const instrumentNotes = notes[instrument];
            if (instrument === "drums") {
                instrumentNotes.push({
                    startTime: time,
                    endTime: time + drumDuration(token.original),
                    pitch: pitch,
                    volume: 80
                })
            } else {
                if (token.volume === 0) {
                    const start = notesStarted[instrument][pitch];
                    if (start !== undefined) {
                        const {startTime, volume} = start;
                        instrumentNotes.push({
                            startTime: startTime,
                            endTime: time,
                            pitch: pitch,
                            volume: volume / 80
                        });
                        delete notesStarted[instrument][pitch]
                    }
                } else {
                    const previous = notesStarted[instrument][pitch];
                    if (previous !== undefined) {
                        const {startTime, volume} = previous;
                        instrumentNotes.push({
                            startTime: startTime,
                            endTime: time,
                            pitch: pitch,
                            volume: volume / 80
                        });
                    }
                    notesStarted[instrument][pitch] = {startTime: time, volume: token.volume};
                }
            }
        } else if (token.type == "wait") {
            const delay = token.delay;
            const factor = 0.00923081517;
            const seconds = delay * factor;
            time += seconds;
        }
    }

    Object.entries(notesStarted).forEach(([instrument, started]) =>
        Object.entries(started).forEach(([pitch, {startTime, volume}]) =>
            notes[instrument as Instrument].push({
                pitch: parseInt(pitch),
                startTime,
                endTime: time,
                volume: volume / 80
            })
        )
    );

    Object.values(notes).forEach(instrumentNotes => instrumentNotes.sort((a, b) => a.startTime - b.startTime));
    return {
        notes,
        duration: time
    };
}

type TokenBase<TYPE extends string> = {
    type: TYPE
}

type TokenNote = TokenBase<"note"> & {
    pitch: number;
    original: number;
    instrument: Instrument;
    volume: number;
}

type TokenWait = TokenBase<"wait"> & {
    delay: number;
}

type TokenStart = TokenBase<"start">

export type Token = TokenNote | TokenWait | TokenStart;

const tokenInfo = [
    ["piano", 0],
    ["piano", 24],
    ["piano", 32],
    ["piano", 40],
    ["piano", 48],
    ["piano", 56],
    ["piano", 64],
    ["piano", 72],
    ["piano", 80],
    ["piano", 88],
    ["piano", 96],
    ["piano", 104],
    ["piano", 112],
    ["piano", 120],
    ["violin", 80],
    ["violin", 0],
    ["cello", 80],
    ["cello", 0],
    ["bass", 80],
    ["bass", 0],
    ["guitar", 80],
    ["guitar", 0],
    ["flute", 80],
    ["flute", 0],
    ["clarinet", 80],
    ["clarinet", 0],
    ["trumpet", 80],
    ["trumpet", 0],
    ["harp", 80],
    ["harp", 0],
    ["drums", 80]
] as const;

export function parseToken(token: number): Token | null {
    if (token >= 0 && token < 3968) {
        const [instrument, volume] = tokenInfo[token >> 7];
        return {type: "note", original: token, pitch: token % 128, instrument, volume};
    }
    if (token < 4096) return {type: "wait", delay: (token % 128) + 1};
    if (token === 4097) return {type: "wait", delay: (4067 % 128) + 1};
    return null;
}

