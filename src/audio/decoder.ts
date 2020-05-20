import {MusenetEncoding} from "../state/encoding";
import {Instrument} from "../constants";
import {Notes} from "../state/notes";
import {drumDuration} from "./audioRender";

export function decode(originalEncoding: MusenetEncoding): {
    notes: Notes;
    duration: number;
    encoding: MusenetEncoding;
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

    const tokens: Token[] = originalEncoding.map(encodingToToken).filter(it => it !== null) as Token[];
    const outputEncoding: MusenetEncoding = [];

    for (const token of tokens) {
        if (token.type === "note") {
            const {instrument, pitch} = token;
            const instrumentNotes = notes[instrument];
            if (instrument === "drums") {
                outputEncoding.push(tokenToEncoding(token));
                instrumentNotes.push({
                    startTime: time,
                    endTime: time + drumDuration(token.original),
                    pitch: pitch,
                    volume: 80
                })
            } else {
                if (token.volume === 0) {
                    outputEncoding.push(tokenToEncoding(token));
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
                        outputEncoding.push(tokenToEncoding({
                            original: null as any,
                            type: "note",
                            pitch: pitch,
                            instrument: instrument,
                            volume: 0
                        }));
                        const {startTime, volume} = previous;
                        instrumentNotes.push({
                            startTime: startTime,
                            endTime: time,
                            pitch: pitch,
                            volume: volume / 80
                        });
                    }
                    outputEncoding.push(tokenToEncoding(token));
                    notesStarted[instrument][pitch] = {startTime: time, volume: token.volume};
                }
            }
        } else if (token.type == "wait") {
            const delay = token.delay;
            const factor = 0.00923081517;
            const seconds = delay * factor;
            time += seconds;
            outputEncoding.push(tokenToEncoding(token));
        }
    }

    Object.entries(notesStarted).forEach(([instrument, started]) =>
        Object.entries(started).forEach(([pitch, {startTime, volume}]) => {
            const pitchNumber = parseInt(pitch);
                outputEncoding.push(tokenToEncoding({
                    original: null as any,
                    type: "note",
                    pitch: pitchNumber,
                    instrument: instrument as Instrument,
                    volume: 0
                }));
                notes[instrument as Instrument].push({
                    pitch: pitchNumber,
                    startTime,
                    endTime: time,
                    volume: volume / 80
                })
            }
        )
    );

    Object.values(notes).forEach(instrumentNotes => instrumentNotes.sort((a, b) => a.startTime - b.startTime));
    return {
        encoding: outputEncoding,
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

export type Token = TokenNote | TokenWait;

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

export function encodingToToken(encoded: number): Token | null {
    if (encoded >= 0 && encoded < 3968) {
        const [instrument, volume] = tokenInfo[encoded >> 7];
        return {type: "note", original: encoded, pitch: encoded % 128, instrument, volume};
    }
    if (encoded < 4096) return {type: "wait", delay: (encoded % 128) + 1};
    if (encoded === 4097) return {type: "wait", delay: (4067 % 128) + 1};
    return null;
}

function tokenToEncoding(token: Token): number {
    if (token.type === "wait") return 3967 + token.delay;
    const idx = tokenInfo.findIndex(([inst, vol]) => inst === token.instrument && vol === token.volume);
    return (idx << 7) + token.pitch;
}