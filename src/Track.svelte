<script>
  import { request } from "./broker.js";
  import {
    deriveTrackStore,
    trackTreeStore,
    selectedPathStore,
    selectedTrackAudioStore,
    selectedTrackEncodingStore
  } from "./trackTree.js";
  import { configStore } from "./settings.js";

  export let parent;
  export let siblingId;
  $: path = [...parent, siblingId];
  $: trackStore = deriveTrackStore(path);
  $: children = $trackStore.children ? $trackStore.children : [];

  function select() {
    trackTreeStore.select(parent, siblingId);
  }
</script>

  <button on:click={select}>{siblingId}</button>
