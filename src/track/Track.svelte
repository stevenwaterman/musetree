<script>
  import {
    selectedPathStore,
    selectedTrackAudioStore,
    selectedTrackStore
  } from "./trackTree.js";
  import { canvasWidth } from "../constants.js";
  import Timeline from "./Timeline.svelte";
  import TrackRowOptions from "./TrackRowOptions.svelte";
  import TrackCanvas from "./TrackCanvas.svelte";
  import { slide } from "svelte/transition";

  $: rows = $selectedPathStore.map((element, idx, array) => ({
    path: array.slice(0, idx),
    selected: array[idx]
  }));
</script>

<style>
  .container {
    overflow-y: auto;
    flex-shrink: 0;
    height: 90vh;
  }

  .negativeMargin {
    margin-bottom: -4px;
  }
</style>

<div class="container">
  <Timeline />
  {#each rows as { path, selected }, idx (JSON.stringify(path) + selected)}
    <div class="trackRow negativeMargin" transition:slide|local>
      <TrackCanvas path={[...path, selected]} />
    </div>
  {/each}
  <div class="trackRow">
    <TrackRowOptions path={$selectedPathStore} />
  </div>
</div>
