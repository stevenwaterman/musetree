<script>
  import {
    deriveTrackStore,
    trackTreeStore,
    selectedPathStore,
    selectedTrackAudioStore,
    selectedTrackEncodingStore
  } from "./trackTree.js";
  import { request } from "./broker.js";
  import { afterUpdate } from "svelte";
  import { configStore, autoRequestStore } from "./settings.js";
  import {
    instruments,
    instrumentSettings,
    pitchMin,
    yScaleStore,
    canvasWidth,
    xScale
  } from "./constants.js";
  import { audio } from "./audio.js";
  import ChildButton from "./ChildButton.svelte";

  export let path;

  $: trackStore = deriveTrackStore(path);

  $: children = $trackStore.children ? $trackStore.children : {};
  $: track = $trackStore.track ? $trackStore.track : null;
  $: duration = track ? track.duration : 0;

  function loadMore() {
    const pathCapture = path;
    const encoding = track ? track.encoding : "";

    trackStore.requestStart();

    return request($configStore, encoding, duration)
      .then(tracks => trackTreeStore.addTracks(pathCapture, tracks))
      .finally(_ => trackTreeStore.requestDone(pathCapture));
  }
  $: if (
    $autoRequestStore &&
    !$trackStore.childOffset &&
    !$trackStore.pendingLoad
  )
    loadMore();
</script>

<style>
  .buttonRow {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    flex-grow: 0;
    flex-shrink: 0;
    background: black;
    border: 1px solid white;
  }
  .rowButton {
    margin: 4px;
    padding: 4px;
    border: 1px solid black;
    cursor: pointer;
  }
</style>

<div class="buttonRow" style={'width: ' + canvasWidth + 'px'}>
  {#each Object.keys(children) as idx}
    <ChildButton {path} siblingId={idx} />
  {/each}
  <button class="rowButton" on:click={loadMore}>
    Load More{$trackStore.pendingLoad ? ' (' + $trackStore.pendingLoad * 4 + ' pending)' : ''}
  </button>
  <button
    class="rowButton"
    on:click={() => console.log(JSON.stringify($trackStore))}>
    Log
  </button>
</div>
