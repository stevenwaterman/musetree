<script lang="ts">
  import { contextModalStore } from "./ContextModalStore";
  import type { ContextModalState } from "./ContextModalStore";
  import { getContext, afterUpdate } from "svelte";
  import ImportModal from "../persistence/ImportModal.svelte";
  import ExportModal from "../persistence/ExportModal.svelte";
  import Button from "../buttons/Button.svelte";
  import { configStore } from "../state/settings";
  import colorLookup, { modalOptions } from "../colors";
  import {request} from "../bridge/broker";
  import DeleteConfirmationModal from "./DeleteConfirmationModal.svelte";
  import { toReadableNodeState } from "../state/trackTree";
  import type { NodeStore, NodeState, BranchStore } from "../state/trackTree";
  import type { Readable } from "svelte/store"
  import toCss from "react-style-object-to-css";

  let contextModalState: ContextModalState;
  $: contextModalState = $contextModalStore;

  let coordinates: [number, number] | null;
  $: coordinates =
    contextModalState === null ? null : contextModalState.coordinates;

  let left: number | null;
  $: left = coordinates === null ? null : coordinates[0] - 40;

  let top: number | null;
  $: top = coordinates === null ? null : coordinates[1] - 40;

  let showRoot: boolean;
  $: showRoot =
    contextModalState !== null && contextModalState.stores.type === "root";

  let showBranch: boolean;
  $: showBranch =
    contextModalState !== null && contextModalState.stores.type === "branch";

  let parentStore: NodeStore | null;
  $: parentStore =
    showBranch &&
    contextModalState &&
    contextModalState.stores.type === "branch"
      ? contextModalState.stores.parentStore
      : null;

  let nodeStore: NodeStore | null;
  $: nodeStore =
    contextModalState === null ? null : contextModalState.stores.nodeStore;

  let convertedNodeStore: Readable<NodeState> | null;
  $: convertedNodeStore =
    nodeStore === null ? null : toReadableNodeState(nodeStore);

  let nodeState: NodeState | null;
  $: nodeState = convertedNodeStore === null ? null : $convertedNodeStore;

  let children: Record<number, BranchStore> | null;
  $: children = nodeState === null ? null : nodeState.children;

  let path: number[] | null;
  $: path = nodeState === null ? null : nodeState.path;

  let childIndex: number | null;
  $: childIndex = path === null ? null : path[path.length - 1];

  const { open } = getContext("simple-modal");

  function hide() {
    contextModalStore.set(null);
  }

  function loadMore() {
    hide();
    if (nodeStore && nodeState) request($configStore, nodeStore, nodeState);
  }

  function openDeleteModal() {
    hide();
    open(DeleteConfirmationModal, {}, modalOptions);
  }

  function deleteBranch() {
    hide();
    if (parentStore && childIndex) parentStore.deleteChildWithUndo(childIndex);
  }

  function openImportModal() {
    hide();
    open(
      ImportModal,
      {
        importUnderStore: nodeStore,
      },
      modalOptions
    );
  }

  function openExportModal() {
    hide();
    open(
      ExportModal,
      {
        store: nodeStore,
      },
      modalOptions
    );
  }

  function keyPressed(event: KeyboardEvent) {
    if (event.key === "r") return loadMore();
    if (event.key === "a") return openImportModal();
    if (event.key === "s" && showBranch) return openExportModal();
    if (event.key === "d" && showRoot) return openDeleteModal();
    if (event.key === "d" && showBranch) return deleteBranch();
  }

  let rootContainer: HTMLDivElement | undefined;
  let branchContainer: HTMLDivElement | undefined;

  afterUpdate(() => {
    if (rootContainer) rootContainer.focus();
    if (branchContainer) branchContainer.focus();
  });
</script>

<style>
  .container {
    position: fixed;
    z-index: 2;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }

  .contextModal {
    position: absolute;
    display: flex;
    flex-direction: column;
    margin: 25px;
    width: 150px;
    pointer-events: all;
    padding: 4px;
    outline: none;
  }
</style>

<div class="container">
  {#if showRoot}
    <div
      class="contextModal"
      style={toCss({ backgroundColor: colorLookup.bgDark, border: '1px solid', borderColor: colorLookup.border, color: colorLookup.textDark, left, top})}
      bind:this={rootContainer}
      on:mouseleave={hide}
      on:mousedown
      on:contextmenu|preventDefault|stopPropagation
      on:keydown={keyPressed}
      tabindex={0}>
      <Button on:click={loadMore}>
        <u>R</u>equest More
      </Button>
      <Button on:click={openImportModal}>
        <u>A</u>dd Midi
      </Button>
      <Button on:click={openDeleteModal}>
        <u>D</u>elete All
      </Button>
    </div>
  {/if}

  {#if showBranch}
    <div
      class="contextModalContainer"
      on:mouseleave={hide}
      style={toCss({left, top})}>
      <div
        class="contextModal"
        style={toCss({backgroundColor: colorLookup.bgDark, border: "1px solid", borderColor: colorLookup.border, color: colorLookup.textDark, left, top})}
        bind:this={branchContainer}
        on:mousedown|preventDefault|stopPropagation
        on:contextmenu|preventDefault|stopPropagation
        on:keydown={keyPressed}
        tabindex={0}>
        <Button on:click={loadMore}>
          <u>R</u>equest More
        </Button>
        <Button on:click={openImportModal}>
          <u>A</u>dd Midi
        </Button>
        <Button on:click={openExportModal}>
          <u>S</u>ave Audio
        </Button>
        <Button on:click={deleteBranch}>
          <u>D</u>elete Branch
        </Button>
        <!--         TODO   <Button>Edit</Button>-->
      </div>
    </div>
  {/if}
</div>
