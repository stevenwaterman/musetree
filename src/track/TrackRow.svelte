<script>
  import { deriveTrackStore, trackTreeStore } from "./trackTree.js";
  import { configStore, autoRequestStore } from "../settings.js";
  
  import TrackCanvas from "./TrackCanvas.svelte";
  import TrackRowOptions from "./TrackRowOptions.svelte";
  import { canvasWidth } from "../constants.js";
  import ChildButton from "./ChildButton.svelte";

  export let path;
  $: trackStore = deriveTrackStore(path);

  $: children = $trackStore.children ? $trackStore.children : {};
  $: track = $trackStore.track ? $trackStore.track : null;
  $: duration = track ? track.duration : 0;
</script>

<style>
  .trackRow {
    display: flex;
    flex-direction: row;
  }
</style>

<div class="trackRow">
  {#if $trackStore.selected == null}
    <TrackRowOptions {path} />
  {:else}
    <TrackCanvas path={[...path, $trackStore.selected]} />
  {/if}
</div>
