<script>
  import {
    selectedPathStore,
    selectedTrackAudioStore,
  } from "./trackTree.js";
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
    display: flex;
    flex-direction: column;
    /* align-items: center; */
    /* justify-content: center; */
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
    <div class="staticSize" transition:slide|local>
      <TrackCanvas path={[...path, selected]} section={idx} last={idx === rows.length - 1}/>
    </div>
  {:else}
      <span class="placeholder">Use the controls below to begin</span>
  {/each}
</div>
<TrackRowOptions path={$selectedPathStore} />
