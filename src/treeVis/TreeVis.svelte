<script>
  import {onMount, afterUpdate} from "svelte";
  import {autoPlayStore, preplayStore, configStore} from "../state/settings";
  import {request} from "../broker";
  import {root} from "../state/trackTree";
  import panzoom from "panzoom";
  import TreeVisRoot from "./TreeVisRoot.svelte";
  import colorLookup from "../colors";

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
    height: 100%;
    width: 100%;
    flex-shrink: 0;
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
  <div class="tree-container" style={"color: " + colorLookup.textEmphasis + ";background-color: " + colorLookup.bgLight + "; border-left: 1px solid " + colorLookup.border}>
    <div class="pan-container" bind:this={container}>
      <div class="tree-position">
        <TreeVisRoot/>
      </div>
    </div>
  </div>
{/if}
