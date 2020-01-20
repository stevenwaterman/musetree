<script>
	import {request} from "./broker.js";
	import {selectedTrackStore, selectedTrackAudioStore, selectedTrackEncodingStore} from "./selectedTrack.js";
	import {configStore} from "./settings.js";

	async function loadMore(){
		const params = {...$configStore, encoding: $selectedTrackEncodingStore};
		const tracks = await request(params);
		selectedTrackStore.set(tracks[0]);
	}
</script>

<main>
	<button on:click={loadMore}>Load More</button>
	<audio controls src={$selectedTrackAudioStore}>
</main>

<style>
</style>
