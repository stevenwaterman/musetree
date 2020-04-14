import {MusenetEncoding} from "../state/encoding";
import {Instrument} from "../constants";

export type AudioNote = {
    /**
     * Musenet Pitch
     */
    pitch: number;

    /**
     * Start time, in seconds
     */
    startTime: number;

    /**
     * Duration, in seconds
     */
    endTime: number;

    /**
     * Volume on a 0..1 scale
     */
    volume: number;
};
export type AudioNotes = Record<Instrument, AudioNote[]>;

export function decode(encoded: MusenetEncoding): AudioNotes {
    const notes: AudioNotes = {
        piano: [],
        violin: [],
        cello: [],
        bass: [],
        guitar: [],
        flute: [],
        clarinet: [],
        trumpet: [],
        harp: [],
        drum: []
    };
    const notesStarted: Record<Instrument, Record<number, {startTime: number, volume: number}>> = {
        piano: {},
        violin: {},
        cello: {},
        bass: {},
        guitar: {},
        flute: {},
        clarinet: {},
        trumpet: {},
        harp: {},
        drum: {}
    };
    let time: number = 0;

    const tokens: Token[] = encoded.map(parseToken).filter(it => it !== null) as Token[];
    tokens.forEach(token => {
        if (token.type === "note") {
            const {instrument, pitch} = token;
            const instrumentNotes = notes[instrument];
            if(token.volume === 0) {
                const start = notesStarted[instrument][pitch];
                if(start !== undefined) {
                    const {startTime, volume} = start;
                    instrumentNotes.push({
                        startTime: startTime / 100,
                        endTime: time / 100,
                        pitch: pitch,
                        volume: volume / 80
                    });
                    console.log("Adding", startTime, time, pitch);
                    delete notesStarted[instrument][pitch]
                }
            } else {
                const previous = notesStarted[instrument][pitch];
                if(previous !== undefined) {
                    const {startTime, volume} = previous;
                    instrumentNotes.push({
                        startTime: startTime / 100,
                        endTime: time / 100,
                        pitch: pitch,
                        volume: volume / 80
                    });
                    console.log("Adding Prematurely", startTime, time, pitch);
                }
                notesStarted[instrument][pitch] = {startTime: time, volume: token.volume};
            }
        } else if (token.type == "wait") {
            time += token.delay;
        }
    });

    Object.values(notes).forEach(instrumentNotes => instrumentNotes.sort((a,b) => a.startTime - b.startTime));
    return notes;
}

type TokenBase<TYPE extends string> = {
    type: TYPE
}

type TokenNote = TokenBase<"note"> & {
    pitch: number;
    instrument: Instrument;
    volume: number;
}

type TokenWait = TokenBase<"wait"> & {
    delay: number;
}

type TokenStart = TokenBase<"start">

export type Token = TokenNote | TokenWait | TokenStart;

const tokenInfo: Array<[Instrument, number]> = [
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
    ["harp", 0]
];

export function parseToken(token: number): Token | null {
    if (token >= 0 && token < 3840) {
        const [instrument, volume] = tokenInfo[token >> 7];
        return {type: "note", pitch: token % 128, instrument, volume};
    }
    if (token < 3968) return {type: "note", pitch: token % 128, instrument: "drum", volume: 80};
    if (token < 4096) return {type: "wait", delay: (token % 128) + 1};
    return null;
}