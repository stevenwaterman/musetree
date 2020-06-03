import {Section} from "../state/section";
import {act} from "@testing-library/svelte";

export function getPitchRange(sections: Section[]): {minPitch: number, maxPitch: number} {
    const pitches: number[] = sections.flatMap(section => Object.values(section.notes).flat()).map(note => note.pitch);
    if (pitches.length) {
        const minPitch = Math.min(...pitches);
        const maxPitch = Math.max(...pitches);
        const desiredRange = maxPitch - minPitch;
        const minAllowedRange = 20;
        const actualRange = Math.max(desiredRange, minAllowedRange);
        const padding = (actualRange - desiredRange)/2;
        return {
            minPitch: minPitch - padding,
            maxPitch: maxPitch + padding
        }
    } else {
        return {
            minPitch: -1,
            maxPitch: -1
        }
    }
}