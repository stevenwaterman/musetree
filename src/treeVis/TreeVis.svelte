<script>
  import {afterUpdate} from "svelte";
  import {root} from "../state/trackTree";
  import panzoom from "panzoom";
  import TreeVisRoot from "./TreeVisRoot.svelte";
  import colorLookup from "../colors";
  import ContextModal from "./ContextModal.svelte";
  import {contextModalStore} from "./ContextModalStore";


  let container;

  afterUpdate(() => {
    const pan = panzoom(container, {
      minZoom: 0.1,
      maxZoom: 2,
      zoomDoubleClickSpeed: 1,
      smoothScroll: false
    });
    pan.on("pan", () => contextModalStore.set(null));
    pan.on("zoom", () => contextModalStore.set(null));
    pan.on("transform", () => contextModalStore.set(null));
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
    <ContextModal/>
    <div class="pan-container" bind:this={container}>
      <div class="tree-position">
        <TreeVisRoot/>
      </div>
    </div>
  </div>
{/if}
