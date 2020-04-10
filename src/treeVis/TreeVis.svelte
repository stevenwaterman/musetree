<script>
  import {onMount, afterUpdate} from "svelte";
  import {autoPlayStore, preplayStore, configStore} from "../state/settings";
  import {audio} from "../state/audio";
  import {request} from "../broker";
  import {root} from "../state/trackTree";
  import panzoom from "panzoom";
  import TreeVisRoot from "./TreeVisRoot.svelte";

  let container;

  afterUpdate(() => {
    panzoom(container, {
      minZoom: 0.1,
      maxZoom: 2,
      zoomDoubleClickSpeed: 1,
      smoothScroll: false
    });
    // TODO middle click = reset zoom
  })
</script>

<style>
  .tree-container {
    border-left: 1px solid white;
    height: 100%;
    width: 100%;
    flex-shrink: 0;
    background-color: black;
    overflow: hidden;
  }

  .pan-container {
    height: 100%;
  }

  .tree-position {
    position: absolute;
    left: 50%;
    right: 50%;
    top: 50%;
    bottom: 50%;
  }
</style>

{#if root != null}
  <div class="tree-container">
    <div class="pan-container" bind:this={container}>
      <div class="tree-position">
        <TreeVisRoot/>
      </div>
    </div>
  </div>
{/if}
