<script>
	import {selectedTrackAudioStore, selectedTrackStore} from "./trackTree.js";
	import Track from "./Track.svelte";
</script>

<main>
	<Track path={[]}/>
	<audio controls src={$selectedTrackAudioStore}/>
</main>

<style>
</style>
