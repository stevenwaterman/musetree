import { Readable } from "svelte/store";

export type StateFor<Store extends Readable<any>> = Store extends Readable<infer T> ? T : never;