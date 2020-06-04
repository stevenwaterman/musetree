import {Section} from "../state/section";
import {CompleteNote} from "../state/notes";
import {Instrument, instruments} from "../constants";

export function getNumberOfNotes(sections: Section[]): number {
    return sections.map(getNumberOfNotesOneSection).reduce((a, b) => a + b, 0);
}

function getNumberOfNotesOneSection(section: Section): number {
    return Object.values(section.notes).flat().filter(note => note.type === "COMPLETE").length;
}

export function getNumberOfTokens(sections: Section[]): number {
    return sections.map(section => section.encoding.length).reduce((a,b)=>a+b,0);
}

export function getSilences(sections: Section[]): {
    startTime: number;
    endTime: number;
}[] {
    if (sections.length === 0) return [];

    const notes = getNotes(sections);
    const startsAt = sections[0].startsAt;
    const endsAt = sections[sections.length - 1].endsAt;
    return getSilencesInternal(notes, startsAt, endsAt);
}

export function getSilencesInternal(notes: { startTime: number, endTime: number }[], startsAt: number, endsAt: number): {
    startTime: number;
    endTime: number;
}[] {
    let silences: {
        startTime: number;
        endTime: number;
    }[] = [];
    let nextSilence: number = startsAt;

    notes.forEach(note => {
        const startTime = note.startTime;
        if (nextSilence < startTime) {
            // a period of silence just happened
            silences.push({
                startTime: nextSilence,
                endTime: startTime
            })
        }
        nextSilence = Math.max(nextSilence, note.endTime)
    });

    if (nextSilence < endsAt) {
        silences.push({
            startTime: nextSilence,
            endTime: endsAt
        })
    }

    return silences
}


export function getMaxSilence(silences: {
    startTime: number;
    endTime: number;
}[]): {
    startTime: number;
    endTime: number;
} | null {
    let maxDuration = 0;
    let maxSilence: {
        startTime: number;
        endTime: number;
    } | null = null;

    silences.forEach(silence => {
        const duration = silence.endTime - silence.startTime;
        if (duration > maxDuration) {
            maxSilence = silence;
            maxDuration = duration;
        }
    })

    return maxSilence;
}

export function getInstrumentPrevalences(sections: Section[]): Record<Instrument, {
    noteCount: number;
    totalPlayingTime: number;
    nonSilenceTime: number;
}> {
    const map: Record<Instrument, {
        noteCount: number;
        totalPlayingTime: number;
        nonSilenceTime: number;
    }> = {} as any;

    instruments.forEach(instrument => map[instrument] = oneInstrumentPrevalence(sections, instrument));
    return map;
}

function oneInstrumentPrevalence(sections: Section[], instrument: Instrument): {
    noteCount: number;
    totalPlayingTime: number;
    nonSilenceTime: number;
} {
    if (sections.length === 0) return {noteCount: 0, totalPlayingTime: 0, nonSilenceTime: 0};

    const notes = getNotes(sections, instrument);
    const noteCount = notes.length;

    const totalPlayingTime = notes
        .map(({startTime, endTime}) => endTime - startTime)
        .reduce((a, b) => a + b, 0);

    const startTime = sections[0].startsAt;
    const endTime = sections[sections.length - 1].endsAt;
    const totalTime = endTime - startTime;

    const silences = getSilencesInternal(notes, startTime, endTime);
    const silenceTime = silences.map(silence => silence.endTime - silence.startTime).reduce((a, b) => a + b, 0);
    const nonSilenceTime = totalTime - silenceTime;

    return {
        noteCount,
        totalPlayingTime,
        nonSilenceTime
    }
}

function getNotes(sections: Section[], instrument?: Instrument): { startTime: number, endTime: number }[] {
    return sections.flatMap((section, idx) => {
        const notes = instrument === undefined ? Object.values(section.notes).flat() : section.notes[instrument];
        if (idx === sections.length - 1) {
            return notes.map(note => ({
                startTime: note.startTime + section.startsAt,
                endTime: note.type === "COMPLETE" ? note.endTime + section.startsAt : section.endsAt
            }))
        } else {
            return notes.filter(note => note.type === "COMPLETE").map(note => ({
                startTime: note.startTime + section.startsAt,
                endTime: (note as CompleteNote).endTime + section.startsAt
            }))
        }
    }).sort((a, b) => a.startTime - b.startTime);
}