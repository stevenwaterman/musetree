<script>
  import Track from "./Track.svelte";
  import { deriveTrackStore, trackTreeStore } from "./trackTree.js";
  import { configStore } from "./settings.js";
  import { request } from "./broker.js";
  import { onMount } from "svelte";
  import TrackCanvas from "./TrackCanvas.svelte";
  import {audio} from "./audio.js";

  export let path;
  $: trackStore = deriveTrackStore(path);

  $: children = $trackStore.children ? $trackStore.children : [];
  $: track = $trackStore.track ? $trackStore.track : null;
  $: duration = track ? track.duration : 0;
  $: selected = $trackStore.selected;
  $: text = path.length ? path[path.length - 1] : null;
  
  function loadMore() {
    const pathCapture = path;
    const encoding = track ? track.encoding : "";
    

    trackStore.requestStart();

    return request($configStore, encoding, duration)
      .then(tracks => trackTreeStore.addTracks(pathCapture, tracks))
      .finally(_ => trackTreeStore.setRequestStatus(pathCapture, false));
  }
  $: if (children.length === 0 && !$trackStore.pendingLoad) loadMore();

  function log() {
    console.log(path);
    console.log(JSON.stringify($trackStore));
  }
</script>

<style>
  .trackRow {
    display: flex;
    flex-direction: row;
  }
</style>

<div class="trackRow">
  {#if $trackStore.pendingLoad}
    <p>Loading...</p>
  {:else}
    <button on:click={log} disabled={children.length === 0}>Log</button>
    <button on:click={loadMore} disabled={$trackStore.pendingLoad}>
      Load More
    </button>
    {#if selected !== null}
      <TrackCanvas path={[...path, selected]} />
    {/if}
    {#each children as child, i}
      <Track parent={path} siblingId={i} />
    {/each}
  {/if}

</div>
