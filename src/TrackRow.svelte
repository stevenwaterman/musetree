<script>
  import Track from "./Track.svelte";
  import { deriveTrackStore, trackTreeStore } from "./trackTree.js";
  import { configStore } from "./settings.js";
  import { request } from "./broker.js";
  import { onMount } from "svelte";

  export let path;
  $: trackStore = deriveTrackStore(path);
  $: children = $trackStore.children ? $trackStore.children : [];
  $: if (children.length === 0 && !$trackStore.pendingLoad) loadMore();

  function loadMore() {
    const pathCapture = path;
    const track = $trackStore.track;
    const encoding = track ? track.musenetEncoding : "";
    const params = { ...$configStore, encoding };
    trackStore.requestStart();
    return request(params)
      .then(tracks => trackTreeStore.addTracks(pathCapture, tracks))
      .finally(_ => trackTreeStore.setRequestStatus(pathCapture, false));
  }

  function log() {
    console.log(path);
    console.log(JSON.stringify($trackStore));
  }

  $: text = path.length ? path[path.length - 1] : null;
</script>

<style>
  .trackRow {
    display: flex;
    flex-direction: row;
  }
</style>

<main>
  <div class="trackRow">
    {#if text != null}
      <div>{text}</div>
    {/if}
    <button on:click={log}>Log</button>
    <button on:click={loadMore} disabled={$trackStore.pendingLoad}>Load More</button>
    {#each children as child, i}
      <Track parent={path} siblingId={i} />
    {/each}
  </div>
</main>
