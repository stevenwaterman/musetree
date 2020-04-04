<script>
  import {deriveBranchDecorationStore, root} from "../state/trackTree";
  import {writable} from "svelte/store";

  // import { deriveNodeStore, trackTreeStore } from "./trackTree.js";
  // import { configStore, autoRequestStore } from "../state/settings";
  // import { slide } from "svelte/transition";
  // import { audio } from "../state/audio";
  import ChildButton from "./ChildButton.svelte";
  import {configStore} from "../state/settings";
  import { request } from "../broker";
  import {createTrackStore} from "../state/track";

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

    const nodeStoreCapture = nodeStore;
    const encoding = nodeState.encoding || [];
    const track = nodeState.track;
    const duration = track ? track.endsAt : 0;

  //   nodeStore.requestStart();
    return request($configStore, encoding, duration)
      .then(tracks => tracks.forEach(track => {
        const trackStore = createTrackStore(track);
        const decorationStore = deriveBranchDecorationStore(nodeStoreCapture, trackStore);
        nodeStoreCapture.addChild(decorationStore);
      }))
      // .finally(_ => trackTreeStore.requestDone(pathCapture));
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
    Load More{pendingLoad ? ` (${pendingLoad * 4} pending)` : ''}
  </button>
  <button
    class="rowButton"
    on:click={() => console.log(JSON.stringify(nodeState))}>
    Log
  </button>
</div>
