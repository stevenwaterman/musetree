<script lang="ts">
  import { afterUpdate } from "svelte";
  import { root } from "../state/trackTree";
  import panzoom, { PanZoom } from "panzoom";
  import TreeVisRoot from "./TreeVisRoot.svelte";
  import colorLookup from "../colors";
  import ContextModal from "./ContextModal.svelte";
  import { contextModalStore } from "./ContextModalStore"
  import toCss from "react-style-object-to-css";

  let container: HTMLDivElement;

afterUpdate(() => {
    const pan: PanZoom = panzoom(container, {
      minZoom: 0.1,
      maxZoom: 2,
      zoomDoubleClickSpeed: 1,
      smoothScroll: false,
    });
    pan.on("pan", () => contextModalStore.set(null));
    pan.on("zoom", () => contextModalStore.set(null));
    pan.on("transform", () => contextModalStore.set(null));
  });

  let treeContainer: HTMLDivElement;
</script>

<style>
  .tree-container {
    height: 100%;
    width: 100%;
    flex-shrink: 0;
    overflow: hidden;
    outline: none;
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
  <div
    class="tree-container"
    style={toCss({color: colorLookup.textEmphasis, backgroundColor: colorLookup.bgLight, borderLeft: "1px solid", borderColor: colorLookup.border})}
    bind:this={treeContainer}
    on:mouseenter={() => treeContainer.focus()}>
    <ContextModal />
    <div class="pan-container" bind:this={container}>
      <div class="tree-position">
        <TreeVisRoot {treeContainer} />
      </div>
    </div>
  </div>
{/if}
