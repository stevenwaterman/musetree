<script lang="ts">
  import { root } from "../state/trackTree";
  import type { TreeState, BranchStore } from "../state/trackTree";
  import TreeVisBranch from "./TreeVisBranch.svelte";
  import colorLookup, { modalOptions } from "../colors";
  import { contextModalStore } from "./ContextModalStore";
  import ImportModal from "../persistence/ImportModal.svelte";
  import { configStore } from "../state/settings";
  import { getContext } from "svelte";
  import DeleteConfirmationModal from "./DeleteConfirmationModal.svelte";
  import { audioStatusStore } from "../audio/audioPlayer";
  import type { Readable } from "svelte/store"
  import toCss from "react-style-object-to-css";
  import {request} from "../bridge/broker";

  export let treeContainer: HTMLDivElement;

  let branchState: TreeState;
  $: branchState = $root;

  let pendingLoad: number;
  $: pendingLoad = branchState.pendingLoad;

  let childStores: Record<number, BranchStore>;
  $: childStores = branchState.children;

  function leftClick(event: MouseEvent) {
    if (event.button === 0) root.select([]);
  }

  let numberOfLeavesStore: Readable<number>;
  $: numberOfLeavesStore = root.numberOfLeavesStore;

  let numberOfLeaves: number;
  $: numberOfLeaves = $numberOfLeavesStore;

  let placementOffset: number;
  $: placementOffset = -numberOfLeaves / 2;

  let placementStore: Readable<Array<[number, number]>>;
  $: placementStore = root.placementStore;

  let childPlacements: Array<[number, number]>;
  $: childPlacements = $placementStore;

  function rightClick(event: MouseEvent) {
    contextModalStore.set({
      coordinates: [event.clientX, event.clientY],
      stores: {
        type: "root",
        nodeStore: root,
      },
    });
  }

  let node: HTMLDivElement | undefined;

  function focusNode() {
    if (node) node.focus();
  }

  function unfocusNode() {
    if ($contextModalStore === null) treeContainer.focus();
  }

  function loadMore() {
    request($configStore, root, $root);
  }

  function openDeleteModal() {
    open(DeleteConfirmationModal, {}, modalOptions);
  }

  const { open } = getContext("simple-modal");

  function openImportModal() {
    open(
      ImportModal,
      {
        importUnderStore: root,
      },
      modalOptions
    );
  }

  function keyPressed(event: KeyboardEvent) {
    if (event.key === "r") return loadMore();
    if (event.key === "a") return openImportModal();
    if (event.key === "d") return openDeleteModal();
  }

  let audioPlaying: boolean;
  $: audioPlaying = $audioStatusStore.type === "on";

  let nodeColor: string;
  $: nodeColor = audioPlaying
    ? colorLookup.nodePlaying
    : colorLookup.nodeActive;
</script>

<style>
  .node {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 50px;
    height: 50px;
    border-radius: 50%;
    outline: none;

    cursor: pointer;
    transition: transform 0.2s ease-in-out, background-color 0.2s ease-in-out;
  }

  .node:hover {
    transform: scale(1.1, 1.1);
    transform-origin: center;
  }

  .pendingLoad {
    font-size: 18px;
    text-align: center;
    margin: 8px 0 0 0;
    border-radius: 30%;
    width: 100%;
  }

  .placement {
    position: absolute;
    left: -25px;
    z-index: 2;
  }
</style>

{#if childPlacements.length > 0}
  {#each childPlacements as [idx, placement] (idx)}
    <TreeVisBranch
      parentStore={root}
      branchStore={childStores[idx]}
      depth={1}
      offset={placementOffset + placement}
      parentOffset={0}
      {treeContainer} />
  {/each}
{/if}
<div class="placement">
  <div
    on:mousedown={leftClick}
    on:contextmenu|preventDefault={rightClick}
    on:mouseenter={focusNode}
    on:mouseleave={unfocusNode}
    bind:this={node}
    on:keypress={keyPressed}
    class="node"
    style={toCss({backgroundColor: nodeColor})}
    tabindex={0}>
    <span class="label">Root</span>
  </div>
  {#if pendingLoad > 0}
    <p
      class="pendingLoad"
      style={toCss({color: colorLookup.textDark, backgroundColor: colorLookup.bgDark, border: "2px solid", borderColor: colorLookup.border})}>
      +{pendingLoad}
    </p>
  {/if}
</div>
