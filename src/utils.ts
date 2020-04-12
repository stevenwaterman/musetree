import {readable, Readable, Writable, writable} from "svelte/store";
import {run_all} from "svelte/internal";

export function firstLetterUC(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function unwrapStore<T, INNER extends Readable<T | null>>(store_2: Readable<INNER | null>): Readable<T | null> {
    const output: Writable<T | null> = writable(null);
    let unsubscribe: () => void = () => {};
    store_2.subscribe((store: INNER | null) => {
        unsubscribe();
        if(store !== null) {
            unsubscribe = store.subscribe((state: T | null) => {
                output.set(state);
            })
        } else {
            unsubscribe = () => {};
        }
    });
    return output;
}
