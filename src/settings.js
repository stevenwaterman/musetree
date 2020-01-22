import {writable, derived} from "svelte/store";
import {instruments} from "./constants.js";
import {firstLetterUC} from "./utils.js";

function createInstrumentStore(){
	const initialState = {};
	instruments.forEach(instrument => initialState[instrument] = true);

	const {subscribe, update} = writable(initialState);
	const store = {subscribe};
	instruments.forEach(instrument => {
		const name = "set" + firstLetterUC(instrument);
		const func = value => update(state => {
			const newState = {...state};
			newState[instrument] = value;
			return newState;
		});
		store[name] = func;
	});
	return store;
};
export const instrumentStore = createInstrumentStore();

export const generationLengthStore = writable(100);
	
function createGenreStore(){
	const {subscribe, set} = writable("video");
	return {
		subscribe,
		selectVideo: () => set("video")
	};
};
export const genreStore = createGenreStore();
export const temperatureStore = writable(1);
export const truncationStore = writable(27);

export const autoRequestStore = writable(false);

export const configStore = derived([generationLengthStore, genreStore, instrumentStore, temperatureStore, truncationStore], ([$generationLengthStore, $genreStore, $instrumentStore, $temperatureStore, $truncationStore]) => ({
	audioFormat: "mp3",
	encoding: "",
	generationLength: $generationLengthStore,
	genre: $genreStore,
	instrument: $instrumentStore,
	temperature: $temperatureStore,
	truncation: $truncationStore
}));

