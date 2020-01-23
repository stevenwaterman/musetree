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
  import {isScrollingStore} from "../settings.js";

  $: rows = $selectedPathStore.map((element, idx, array) => ({
    path: array.slice(0, idx),
    selected: array[idx]
  }));
</script>

<style>
  .container {
    overflow-y: scroll;
    flex-shrink: 0;
    max-height: 90vh;
    background-color: black;
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
    <div class="staticSize" transition:slide|local>
      <TrackCanvas path={[...path, selected]} section={idx} last={idx === rows.length - 1}/>
    </div>
  {:else}
    <div style={'width:' + canvasWidth + 'px'}>
      <p class="placeholder">Use the controls below to begin</p>
    </div>
  {/each}
</div>
<TrackRowOptions path={$selectedPathStore} />
