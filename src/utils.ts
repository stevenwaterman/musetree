import {derived, Readable, Writable, writable} from "svelte/store";

export function firstLetterUC(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function unwrapStore<T, INNER extends Readable<T | null>>(store_2: Readable<INNER | null>, equality: (a: T, b: T) => boolean = (a,b) => a===b): Readable<T | null> {
    let value: T | null = null;
    const output: Writable<T | null> = writable(null);
    let unsubscribe: () => void = () => {};
    store_2.subscribe((store: INNER | null) => {
        unsubscribe();
        if(store !== null) {
            unsubscribe = store.subscribe((state: T | null) => {
                if (
                    (value === null && state !== null) ||
                    (value !== null && state === null) ||
                    (value !== null && state !== null && !equality(value, state))
                ) {
                    value = state;
                    output.set(state);
                }
            })
        } else {
            unsubscribe = () => {};
            value = null;
            output.set(null);
        }
    });
    return output;
}

type Stores = Readable<any> | [Readable<any>, ...Array<Readable<any>>];
type StoresValues<T> = T extends Readable<infer U> ? U : {
    [K in keyof T]: T[K] extends Readable<infer U> ? U : never;
};
export function maybeDerived<S extends Stores, T>(
    stores: S,
    func: (values: StoresValues<S>) => T,
    initial: T,
    shouldUpdate: (last: T, next: T) => boolean = (a, b) => (a !== b)
): Readable<T> {
    let lastValue: T = initial;
    const actualFunc = (stores: StoresValues<S>, set: (value: T) => void) => {
        const nextValue = func(stores);
        if(shouldUpdate(lastValue, nextValue)) {
            lastValue = nextValue;
            set(nextValue);
        }
    };
    return derived(stores, actualFunc, initial);
}