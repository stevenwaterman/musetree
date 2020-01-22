<script>
  import { deriveTrackStore, trackTreeStore } from "./trackTree.js";
  import { audio } from "./audio.js";

  export let parent;
  export let siblingId;

  $: parentStore = deriveTrackStore(parent);
  $: selected = $parentStore.selected === siblingId;
  $: startsAt = $parentStore.track ? $parentStore.track.duration : 0;

  function select() {
    trackTreeStore.select(parent, siblingId);
    audio.play(startsAt);
  }

  function remove(){
    parentStore.deleteChild(siblingId);
  }
</script>

<style>
  .childButton {
    font-weight: 700;
    min-width: 50px;
    background: white;
    margin: 4px;
    padding: 4px;
    border: 1px solid black;
    cursor: pointer;
    text-align: center;
  }
  .selected {
    background: #aaa;
  }
</style>

<div
  class="childButton"
  class:selected
  on:click={select}
  on:contextmenu|preventDefault={remove}>
  {siblingId}
</div>
