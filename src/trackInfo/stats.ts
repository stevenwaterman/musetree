import {Section} from "../state/section";

export function getNumberOfNotes(sections: Section[]): number {
    return sections.map(getNumberOfNotesOneSection).reduce((a,b) => a+b, 0);
}

function getNumberOfNotesOneSection(section: Section): number {
    return Object.values(section.notes).map(it => it.length).reduce((a,b) => a+b,0);
}

export function getSilences(sections: Section[]): {
    startTime: number;
    endTime: number;
}[] {
    let silences: {
        startTime: number;
        endTime: number;
    }[] = [];
    let nextSilence: number = 0;

    sections.forEach(section => Object.values(section.notes).flat().sort((a,b) => a.startTime - b.startTime).forEach(note => {
        if(nextSilence < note.startTime) {
            // a period of silence just happened
            const silenceLength = note.startTime - nextSilence;
            silences.push({
                startTime: nextSilence,
                endTime: note.startTime
            })
        }
        const endTime = note.type === "COMPLETE" ? note.endTime : section.endsAt;
        nextSilence = Math.max(nextSilence, endTime)
    }));

    return silences;
}

export function getMaxSilence(silences: {
    startTime: number;
    endTime: number;
}[]): {
    startTime: number;
    endTime: number;
} | null {
    let maxDuration = 0;
    let maxSilence:{
        startTime: number;
        endTime: number;
    } | null = null;

    silences.forEach(silence => {
        const duration = silence.endTime - silence.startTime;
        if(duration > maxDuration) {
            maxSilence = silence;
            maxDuration = duration;
        }
    })

    return maxSilence;
}