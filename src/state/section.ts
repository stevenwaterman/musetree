import {derived, Readable, writable, Writable} from "svelte/store";
import {MusenetEncoding} from "./encoding";
import {Notes} from "./notes";
import {BranchState, BranchStore, TreeState} from "./trackTree";
import {unwrapStore} from "../utils";

export type Section = {
    encoding: MusenetEncoding;
    startsAt: number;
    endsAt: number;
    notes: Notes;
    audio: AudioBuffer;
}
export type SectionState = { section: Section; };
export type SectionStore = Writable<SectionState>;
export function createSectionStore(initial: Section): SectionStore {
    const initialState = {section: initial};
    return writable(initialState);
}

export function deriveRootSectionsStore(rootStore: Readable<TreeState>): Readable<null | Section[]> {
    const nested: Readable<Readable<null | Section[]>> = derived(rootStore, (rootState: TreeState) => {
        const selectedChildIdx: number | null = rootState.selectedChild;
        if(selectedChildIdx === null) return writable(null);
        const childrenMap: Record<number, BranchStore> = rootState.children;
        const selectedChild: BranchStore | undefined = childrenMap[selectedChildIdx];
        if(selectedChild === undefined) return writable(null);
        return selectedChild.selectedSectionsStore;
    });
    return unwrapStore<Section[], Readable<null | Section[]>>(nested, sectionArrayEquality);
}

export function deriveBranchSectionsStore(branchStore: Readable<BranchState>): Readable<null | Section[]> {
    const nested: Readable<Readable<null | Section[]>> = derived(branchStore, (branchState: BranchState) => {
        const selectedChildIdx: number | null = branchState.selectedChild;
        if(selectedChildIdx === null) return writable([branchState.section]);
        const childrenMap: Record<number, BranchStore> = branchState.children;
        const selectedChild: BranchStore | undefined = childrenMap[selectedChildIdx];
        if(selectedChild === undefined) return writable([branchState.section]);
        const childSectionsStore = selectedChild.selectedSectionsStore;
        return derived(childSectionsStore, (childSectionsState) => {
            if(childSectionsState === null) return null;
            return [branchState.section, ...childSectionsState];
        });
    });
    return unwrapStore<Section[], Readable<null | Section[]>>(nested, sectionArrayEquality);
}

function sectionArrayEquality(a: Section[], b: Section[]): boolean {
    if(a === b) return true;
    if(a.length !== b.length) return false;
    for(let i = 0; i < a.length; i++) {
        const aSection = a[i];
        const bSection = b[i];
        if(!sectionEquality(aSection,bSection)) return false;
    }
    return true;
}

function sectionEquality(a: Section, b: Section): boolean {
    if(a === b) return true;
    if(a.startsAt !== b.startsAt) return false;
    if(a.encoding.length !== b.encoding.length) return false;
    if(a.encoding === b.encoding) return true;
    for(let i = 0; i < a.encoding.length; i++) {
        const aToken = a.encoding[i];
        const bToken = b.encoding[i];
        if(aToken !== bToken) return false;
    }
    return true;
}