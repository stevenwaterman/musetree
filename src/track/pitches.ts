import {Section} from "../state/section";

export function getPitchRange(sections: Section[]): {minPitch: number, maxPitch: number} {
    const pitches: number[] = sections.flatMap(section => Object.values(section.notes).flat()).map(note => note.pitch);
    if (pitches.length) {
        return {
            minPitch: Math.min(...pitches),
            maxPitch: Math.max(...pitches)
        }
    } else {
        return {
            minPitch: 1,
            maxPitch: 2
        }
    }
}