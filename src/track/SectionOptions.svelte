<script>
  import {root} from "../state/trackTree";
  import {writable} from "svelte/store";

  import ChildButton from "./ChildButton.svelte";
  import {configStore} from "../state/settings";
  import { request } from "../broker";
  import {createSectionStore} from "../state/section";

  $: selectedStore_2 = root.selectedStore_2;
  $: selectedStore = $selectedStore_2;

  $: nodeStore = selectedStore == null ? root : selectedStore;
  $: nodeState = $nodeStore;
  $: children = nodeState.children;

  $: selectedPath = nodeState.path;
  $: lastSelectedChild = nodeState.lastSelected;
  $: pendingLoad = nodeState.pendingLoad;
  //
  function loadMore() {
    if(nodeState === null) return;
    return request($configStore, nodeStore, nodeState);
  }
  // $: if (
  //   $autoRequestStore &&
  //   !$nodeStore.childOffset &&
  //   !pendingLoad
  // )
  //   loadMore();
</script>

<style>
  .buttonRow {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    flex-grow: 0;
    flex-shrink: 0;
    background: black;
    border-top: 1px solid white;
    justify-content: center;
  }
  .rowButton {
    margin: 4px;
    padding: 4px;
  }
</style>

<div class="buttonRow">
  {#each Object.values(children) as childStore}
    <ChildButton nodeStore={childStore} remove={() => console.log("removed")} />
  {/each}
  <button class="rowButton" on:click={loadMore}>
    Load More{pendingLoad ? ` (${pendingLoad} pending)` : ''}
  </button>
  <button
    class="rowButton"
    on:click={() => console.log(JSON.stringify(nodeState))}>
    Log
  </button>
</div>
