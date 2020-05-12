<script>
  import {root} from "../state/trackTree";
  import Button from "../buttons/Button.svelte";

  export let nodeStore;
  export let remove;

  $: state = $nodeStore;
  $: selected = state.wasLastSelectedByParent;
  $: path = state.path;
  $: index = path[path.length - 1];

  function select() {
    root.select(path);
  }

  function preventDefaultRemove(event) {
    event.preventDefault();
    remove(event);
  }
</script>

<Button
  inverted={selected}
  on:click={select}
  on:contextmenu={preventDefaultRemove}>
  {index}
</Button>
