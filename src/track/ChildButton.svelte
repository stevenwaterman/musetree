<script lang="ts">
  import { root, toReadableNodeState } from "../state/trackTree";
  import type {
    NodeStore,
    NodeState,
  } from "../state/trackTree";
  import Button from "../buttons/Button.svelte";
  import type { Readable } from "svelte/store";

  export let nodeStore: NodeStore;
  export let remove: () => void;

  let convertedNodeStore: Readable<NodeState>;
  $: convertedNodeStore = toReadableNodeState(nodeStore);

  let state: NodeState;
  $: state = $convertedNodeStore;

  let selected: boolean;
  $: selected = state.wasLastSelectedByParent;

  let path: number[];
  $: path = state.path;

  let index: number;
  $: index = path[path.length - 1];

  function select() {
    root.select(path);
  }

  function preventDefaultRemove(event: Event) {
    event.preventDefault();
    remove();
  }
</script>

<Button
  emphasise={selected}
  on:click={select}
  on:contextmenu={preventDefaultRemove}>
  {index}
</Button>
