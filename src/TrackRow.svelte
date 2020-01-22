<script>
  import { deriveTrackStore, trackTreeStore } from "./trackTree.js";
  import { configStore, autoRequestStore } from "./settings.js";
  import { request } from "./broker.js";
  import TrackCanvas from "./TrackCanvas.svelte";
  import { canvasWidth } from "./constants.js";
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
      .finally(_ => trackTreeStore.setRequestStatus(pathCapture, false));
  }
  $: if ($autoRequestStore && !$trackStore.childOffset && !$trackStore.pendingLoad) loadMore();
</script>

<style>
  .trackRow {
    display: flex;
    flex-direction: row;
  }
  .buttonRow {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .rowButton {
    margin: 4px;
    padding: 4px;
    border: 1px solid black;
    cursor: pointer;
  }
</style>

<div class="trackRow">
  {#if !$trackStore.childOffset && $trackStore.pendingLoad}
    <p>Loading...</p>
  {:else}
    {#if $trackStore.selected !== null}
      <TrackCanvas path={[...path, $trackStore.selected]} />
    {:else}
      <div style={'width:' + canvasWidth + 'px'} />
    {/if}
    <div>
      <div class="buttonRow">
        {#each Object.keys(children) as idx}
          <ChildButton parent={path} siblingId={idx} />
        {/each}
        <div class="rowButton" on:click={loadMore}>Load More</div>
        <div class="rowButton" on:click={() => console.log(JSON.stringify($trackStore))}>Log</div>
      </div>
    </div>
  {/if}
</div>
