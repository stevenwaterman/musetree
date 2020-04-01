<script>
  import { deriveNodeStore, trackTreeStore } from "./trackTree.js";
  import { audio } from "../state/audio";
  import { preplayStore, autoPlayStore } from "../state/settings";

  export let path;
  export let siblingId;

  $: parentNodeStore = deriveNodeStore(path);
  $: highlight = $parentNodeStore.lastSelected === siblingId;
  $: startsAt = $parentNodeStore.track ? $parentNodeStore.track.endsAt : 0;

  function select() {
    trackTreeStore.select(path, siblingId);
    const playFrom = Math.max(0, startsAt - $preplayStore);
    if ($autoPlayStore) {
      audio.play(playFrom);
    }
  }

  function remove() {
    parentStore.deleteChild(siblingId);
  }
</script>

<style>
  .childButton {
    font-weight: 700;
    min-width: 40px;
    background: white;
    margin: 4px;
    padding: 4px;
    border: 1px solid black;
    cursor: pointer;
    text-align: center;
  }
  .highlight {
    background: #aaa;
  }
</style>

<button
  class="childButton"
  class:highlight
  on:click={select}
  on:contextmenu|preventDefault={remove}>
  {siblingId}
</button>
