<script>
  import {
    selectedPathStore,
    selectedTrackAudioStore,
    selectedTrackStore
  } from "./trackTree.js";
  import {canvasWidth} from "../constants.js";
  import TrackRow from "./TrackRow.svelte";
  import Timeline from "./Timeline.svelte";

  $: paths = $selectedPathStore.map((element, idx, array) =>
    array.slice(0, idx + 1)
  );
</script>

<style>
  .container {
    overflow-y: auto;
    flex-shrink: 0;
    height: 90vh;
  }
</style>

<div class="container">
  <Timeline />
  <TrackRow path={[]} />
  {#each paths as path}
    <TrackRow {path} />
  {/each}
</div>
