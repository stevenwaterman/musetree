<script>
	import {request} from "./broker.js";
	import {deriveTrackStore, trackTreeStore, selectedPathStore, selectedTrackAudioStore, selectedTrackEncodingStore} from "./trackTree.js";
	import {configStore} from "./settings.js";
	import Track from "./Track.svelte";
	
	export let path;
	$: trackStore = deriveTrackStore(path);

	async function loadMore(){
		const track = $trackStore.track;
		const encoding = track ? track.musenetEncoding : "";
		const params = {...$configStore, encoding};
		const tracks = await request(params);
		trackStore.addTracks(tracks);
	}

	function select(){
		selectedPathStore.set(path);
	}
	
	$: children = $trackStore.children;
</script>

<main>
	<button on:click={loadMore} on:mouseenter={select}>Track {JSON.stringify(path)}</button>
	<div class="trackRow">
	{#each children as child, i}
		<Track path={[...path, i]}/>
	{/each}
	</div>
</main>

<style>
	.trackRow{
		display: flex;
		flex-direction: row;
	}
</style>
