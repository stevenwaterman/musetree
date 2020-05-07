<script>
  import {root} from "../state/trackTree";

  export let nodeStore;
  export let remove;

  $: state = $nodeStore;
  $: selected = state.wasLastSelectedByParent;
  $: path = state.path;
  $: index = path[path.length - 1];

  function select() {
    root.select(path);
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
