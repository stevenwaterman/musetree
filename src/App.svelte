<script>
  import {
    selectedPathStore,
    selectedTrackAudioStore,
    selectedTrackStore
  } from "./trackTree.js";
  import TrackRow from "./TrackRow.svelte";
  import { audio } from "./audio.js";
  import Timeline from "./Timeline.svelte";

  $: paths = $selectedPathStore.map((element, idx, array) =>
    array.slice(0, idx + 1)
  );
</script>

<style>
  .container {
    position: relative;
  }
</style>

<main>
  <button on:click={() => audio.play(0)}>Play from Start</button>

  <div class="container">
    <Timeline />
    <TrackRow path={[]} />
    {#each paths as path}
      <TrackRow {path} />
    {/each}
  </div>
</main>
