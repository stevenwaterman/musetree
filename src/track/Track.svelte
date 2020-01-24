<script>
  import {
    selectedPathStore,
    selectedTrackAudioStore,
  } from "./trackTree.js";
  import Timeline from "./Timeline.svelte";
  import TrackRowOptions from "./TrackRowOptions.svelte";
  import TrackCanvas from "./TrackCanvas.svelte";
  import { fade } from "svelte/transition";
  import {isScrollingStore} from "../settings.js";

  $: rows = $selectedPathStore.map((element, idx, array) => ({
    path: array.slice(0, idx),
    selected: array[idx]
  }));
</script>

<style>
  .container {
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    background-color: black;
    height: 100%;
  }

  .staticSize {
    flex-grow: 0;
    flex-shrink: 0;
  }

  .placeholder {
    color: white;
    text-align: center;
  }
</style>

<div class="container" on:wheel={() => isScrollingStore.set(false)}>
  <Timeline />
  {#each rows as { path, selected }, idx (JSON.stringify(path) + selected)}
    <div class="staticSize" in:fade|local>
      <TrackCanvas path={[...path, selected]} section={idx}/>
    </div>
  {:else}
      <span class="placeholder">Use the controls below to begin</span>
  {/each}
</div>
<TrackRowOptions path={$selectedPathStore} />
