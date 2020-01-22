<script>
  import { deriveTrackStore, trackTreeStore } from "./trackTree.js";
  import { audio } from "./audio.js";

  export let path;
  export let siblingId;

  $: parentStore = deriveTrackStore(path);
  $: highlight = $parentStore.lastSelected === siblingId;
  $: startsAt = $parentStore.track ? $parentStore.track.duration : 0;

  function select() {
    trackTreeStore.select(path, siblingId);
    const playFrom = Math.max(0, startsAt - 3)
    audio.play(playFrom);
  }

  function remove(){
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
  {1 + parseInt(siblingId)}
</button>
