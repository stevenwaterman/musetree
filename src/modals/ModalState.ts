import {Writable, writable} from "svelte/store";

export const isLoadingStore: Writable<boolean> = writable(false);