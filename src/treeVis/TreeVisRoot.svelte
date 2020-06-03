<script>
    import {root} from "../state/trackTree";
    import TreeVisBranch from "./TreeVisBranch.svelte";
    import colorLookup, {modalOptions} from "../colors";
    import {contextModalStore} from "./ContextModalStore";
    import ImportModal from "../persistence/ImportModal.svelte";
    import {configStore} from "../state/settings";
    import {getContext} from "svelte";
    import {request} from "../broker";
    import {undoStore} from "../state/undo";
    import DeleteConfirmationModal from "./DeleteConfirmationModal.svelte";
    import {audioStatusStore} from "../audio/audioPlayer";

    export let treeContainer;

    $: branchState = $root;
    $: pendingLoad = branchState.pendingLoad;

    $: childStores = branchState.children;


    function leftClick(event) {
        if (event.button === 0) root.select([]);
    }

    $: numberOfLeavesStore = root.numberOfLeavesStore;
    $: numberOfLeaves = $numberOfLeavesStore;
    $: placementOffset = -(numberOfLeaves) / 2;
    $: placementStore = root.placementStore;
    $: childPlacements = $placementStore

    function rightClick({clientX, clientY}) {
        contextModalStore.set({
            coordinates: [clientX, clientY],
            stores: {
                type: "root",
                nodeStore: root
            }
        });
    }

    let node;

    function focusNode() {
        if (node) node.focus();
    }

    function unfocusNode() {
        if($contextModalStore === null) treeContainer.focus();
    }

    function loadMore() {
        request($configStore, root, $root);
    }

    function openDeleteModal() {
        open(DeleteConfirmationModal, {}, modalOptions);
    }

    const {open} = getContext("simple-modal");

    function openImportModal() {
        open(ImportModal, {
            importUnderStore: root
        }, modalOptions);
    }

    function keyPressed(event) {
        if(event.key === "r") return loadMore();
        if(event.key === "a") return openImportModal();
        if(event.key === "d") return openDeleteModal();
    }

    $: audioPlaying = $audioStatusStore.type === "on";
    $: nodeColor = audioPlaying ? colorLookup.nodePlaying : colorLookup.nodeActive;
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
        transition: transform .2s ease-in-out, background-color 0.2s ease-in-out;
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
        <TreeVisBranch parentStore={root} branchStore={childStores[idx]} depth={1} offset={placementOffset + placement} parentOffset={0}
                       treeContainer={treeContainer}/>
    {/each}
{/if}
<div class="placement">
    <div on:mousedown={leftClick}
         on:contextmenu|preventDefault={rightClick}
         on:mouseenter={focusNode}
         on:mouseleave={unfocusNode} bind:this={node}
         on:keypress={keyPressed}
         class="node"
         style={"background-color: " + nodeColor}
         tabindex={0}

    >
        <span class="label">
            Root
        </span>
    </div>
    {#if pendingLoad > 0}
        <p class="pendingLoad"
           style={"color: " + colorLookup.textDark + "; background-color: " + colorLookup.bgDark + "; border: 2px solid " + colorLookup.border}>
            +{pendingLoad}
        </p>
    {/if}
</div>

