<script>
  import {
    selectedPathStore,
    selectedTrackAudioStore,
    selectedTrackStore
  } from "./trackTree.js";
  import TrackRow from "./TrackRow.svelte";
  import {audio} from "./audio.js";

  $: paths = $selectedPathStore.map((element, idx, array) =>
    array.slice(0, idx + 1)
  );

	function play(){
		audio.seek(0);
		audio.play();
	}
</script>

<main>
	<button on:click={play}>Play from Start</button>
  <TrackRow path={[]} />
  {#each paths as path}
    <TrackRow {path} />
  {/each}
</main>
