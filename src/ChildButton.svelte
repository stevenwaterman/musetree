<script>
  import { deriveTrackStore, trackTreeStore } from "./trackTree.js";
  import {audio} from "./audio.js";

  export let parent;
  export let siblingId;

  $: parentStore = deriveTrackStore(parent);
  $: selected = $parentStore.selected === siblingId;
  $: startsAt = $parentStore.track ? $parentStore.track.duration : 0;

  function select() {
    trackTreeStore.select(parent, siblingId);
    audio.play(startsAt);
  }

  $: buttonClass = "childButton " + (selected ? "selected" : "unselected");
</script>

<style>
  .childButton {
    flex-basis: content;
    margin: 0;
    font-weight: 700;
    min-width: 50px;
  }
  .selected {
    background: #aaa;
  }
  .unselected {
    background: white;
  }
</style>

<button class={buttonClass} on:click={select}>{siblingId}</button>
