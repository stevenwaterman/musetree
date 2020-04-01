<script>
  import { selectedPathStore, selectedTrackAudioStore } from "./trackTree.js";
  import Timeline from "./Timeline.svelte";
  import TrackRowOptions from "./TrackRowOptions.svelte";
  import TrackCanvas from "./TrackCanvas.svelte";
  import { isScrollingStore } from "../state/settings";

  $: rows = $selectedPathStore.map((element, idx, array) => ({
    path: array.slice(0, idx),
    selected: array[idx]
  }));
</script>

<style>
  .container {
    overflow-y: scroll;
    background-color: black;
    height: 100%;
  }

  .placeholder {
    color: white;
    text-align: center;
  }
</style>

<div class="container" on:wheel={() => isScrollingStore.set(false)}>
  <Timeline />
  {#each rows as { path, selected }, idx (JSON.stringify(path) + selected)}
        <TrackCanvas path={[...path, selected]} section={idx} />
  {:else}
    <p class="placeholder">Use the controls below to begin</p>
  {/each}
</div>
<TrackRowOptions path={$selectedPathStore} />
