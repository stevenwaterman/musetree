<script>
  // import { deriveNodeStore, trackTreeStore } from "./trackTree.js";
  // import { audio } from "../state/audio";
  // import { preplayStore, autoPlayStore } from "../state/settings";
  import {root} from "../state/trackTree";

  export let nodeStore;
  export let remove;

  $: state = $nodeStore;
  $: selected = state.wasLastSelectedByParent;
  $: path = state.path;
  $: index = path[path.length - 1];

  // $: startsAt = $parentNodeStore.track ? $parentNodeStore.track.endsAt : 0;

  function select() {
    root.select(path);
  //   const playFrom = Math.max(0, startsAt - $preplayStore);
  //   if ($autoPlayStore) {
  //     audio.play(playFrom);
  //   }
  }
  //
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
  .selected {
    background: #aaa;
  }
</style>

<button
  class="childButton"
  class:selected
  on:click={select}
  on:contextmenu|preventDefault={remove}>
  {index}
</button>
