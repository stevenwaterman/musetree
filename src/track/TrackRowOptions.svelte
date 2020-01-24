<script>
  import { deriveNodeStore, trackTreeStore } from "./trackTree.js";
  import { request } from "../broker.js";
  import { configStore, autoRequestStore } from "../settings.js";
  import { slide } from "svelte/transition";
  import { audio } from "./audio.js";
  import ChildButton from "./ChildButton.svelte";

  export let path;

  $: nodeStore = deriveNodeStore(path);

  $: children = $nodeStore.children ? $nodeStore.children : {};
  $: track = $nodeStore.track ? $nodeStore.track : null;
  $: duration = track ? track.endsAt : 0;
  $: pendingLoad = $nodeStore.pendingLoad;

  function loadMore() {
    const pathCapture = path;
    const encoding = track ? track.encoding : "";

    nodeStore.requestStart();

    return request($configStore, encoding, duration)
      .then(tracks => trackTreeStore.addTracks(pathCapture, tracks))
      .finally(_ => trackTreeStore.requestDone(pathCapture));
  }
  $: if (
    $autoRequestStore &&
    !$nodeStore.childOffset &&
    !pendingLoad
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
    border-top: 1px solid white;
    justify-content: center;
  }
  .rowButton {
    margin: 4px;
    padding: 4px;
  }
</style>

<div class="buttonRow">
  {#each Object.keys(children) as idx}
    <ChildButton {path} siblingId={idx} />
  {/each}
  <button class="rowButton" on:click={loadMore}>
    Load More{pendingLoad ? ` (${pendingLoad * 4} pending)` : ''}
  </button>
  <button
    class="rowButton"
    on:click={() => console.log(JSON.stringify($nodeStore))}>
    Log
  </button>
</div>
