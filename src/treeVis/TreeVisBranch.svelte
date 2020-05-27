<script>
    import {root} from "../state/trackTree";
    import {configStore} from "../state/settings";
    import {request} from "../broker"
    import colorLookup, {modalOptions} from "../colors";
    import {get_store_value} from "svelte/internal";
    import ImportModal from "../persistence/ImportModal.svelte";
    import ExportModal from "../persistence/ExportModal.svelte";
    import {getContext} from "svelte";
    import Button from "../buttons/Button.svelte";
    import {contextModalStore} from "./ContextModalStore";


    export let parentStore;
    export let branchStore;
    export let depth;
    export let offset;
    export let parentOffset;
    export let treeContainer;

    $: branchState = $branchStore;
    $: path = branchState.path;
    $: childIndex = path[path.length - 1];
    $: pendingLoad = branchState.pendingLoad;

    $: childStores = branchState.children;
    $: children = Object.entries(childStores);

    function leftClick(event) {
        if (event.button === 0) root.select(path);
    }

    function rightClick({clientX, clientY}) {
        contextModalStore.set({
            coordinates: [clientX, clientY],
            stores: {
                type: "branch",
                parentStore: parentStore,
                nodeStore: branchStore
            }
        })
    }

    $: onSelectedPath = branchState.onSelectedPath;
    $: selectedByParent = branchState.selectedByParent;
    $: wasLastSelected = branchState.wasLastSelectedByParent;
    $: nodeColor = onSelectedPath ? colorLookup.nodeActive : (selectedByParent || (wasLastSelected && $parentStore.onSelectedPath)) ? colorLookup.nodeWarm : colorLookup.nodeInactive;
    $: edgeColor = onSelectedPath ? colorLookup.edgeActive : (selectedByParent || (wasLastSelected && $parentStore.onSelectedPath)) ? colorLookup.edgeWarm : colorLookup.edgeInactive;

    $: numberOfLeavesStore = branchStore.numberOfLeavesStore;
    $: numberOfLeaves = $numberOfLeavesStore;

    function getChildPlacements(children, numberOfLeaves) {
        const childPlacements = [];
        let currOffset = offset + (-numberOfLeaves / 2);

        children.forEach(([idx, child]) => {
            const width = get_store_value(child.numberOfLeavesStore);
            childPlacements.push([idx, child, currOffset + (width / 2)]);
            currOffset += width;
        });

        return childPlacements;
    }

    $: childPlacements = getChildPlacements(children, numberOfLeaves);

    $: offsetWidth = Math.abs(parentOffset - offset);
    $: cw = offsetWidth * 30;
    $: ch = 150 / 2;
    $: lineWidth = (offsetWidth + 1) * 60;
    $: lineLeft = Math.min(offset, parentOffset) * 60 - 30;

    let node;
    function focusNode() {
        if(node) node.focus();
    }
    function unfocusNode() {
        if($contextModalStore === null) treeContainer.focus();
    }

    const {open} = getContext("simple-modal");

    function loadMore() {
        request($configStore, branchStore, branchState);
    }

    function deleteBranch() {
        parentStore.deleteChild(path[path.length - 1]);
    }

    function openImportModal() {
        open(ImportModal, {
            importUnderStore: branchStore
        }, modalOptions);
    }

    function openExportModal() {
        open(ExportModal, {
            store: branchStore
        }, modalOptions);
    }

    function keyPressed(event) {
        if(event.key === "r") return loadMore();
        if(event.key === "a") return openImportModal();
        if(event.key === "s") return openExportModal();
        if(event.key === "d") return deleteBranch();
    }
</script>

<style>
    .node {
        display: flex;
        justify-content: center;
        align-items: center;

        width: 50px;
        height: 50px;
        border-radius: 50%;

        cursor: pointer;
        outline: none;
        transition: transform .2s ease-in-out, background-color 0.2s ease-in-out;
    }

    .node:hover {
        transform: scale(1.1, 1.1);
        transform-origin: center;
    }

    .label {
        font-size: 30px;
    }

    .pendingLoad {
        font-size: 18px;
        text-align: center;
        margin: 8px 0 0 0;
        border-radius: 30%;
        width: 100%;
    }

    .line {
        position: absolute;
    }

    .placement {
        position: absolute;
        z-index: 1;
    }

    path {
        transition: stroke 0.2s ease-in-out;
    }
</style>


<div class="placement" style={"top: " + (150*depth) + "px; left: " + (60*offset -25) + "px"}>
    <div
            on:mousedown={leftClick}
            on:contextmenu|preventDefault={rightClick}
            on:mouseenter={focusNode}
            on:mouseleave={unfocusNode}
            on:keypress={keyPressed}
            bind:this={node}
            class="node"
            style={"background-color: " + nodeColor}
            tabindex={0}
    >
        <span class="label">
            {childIndex}
        </span>
    </div>
    {#if pendingLoad > 0}
        <p class="pendingLoad" style={"color: " + colorLookup.textDark + "; background-color: " + colorLookup.bgDark + "; border: 2px solid " + colorLookup.border}>
            +{pendingLoad}
        </p>
    {/if}
</div>
{#if childPlacements.length > 0}
    {#each childPlacements as [index, child, childOffset] (index)}
        <svelte:self parentStore={branchStore} branchStore={child} depth={depth + 1} offset={childOffset} parentOffset={offset} treeContainer={treeContainer}/>
    {/each}
{/if}
<svg class="line" width={lineWidth} height={ch * 2}
     style={"left: " + lineLeft + "px; top: " + ((depth-1) * ch * 2 + 25) + "px;" + (offset < parentOffset ? "transform: scaleX(-1)" : "")}>
    <path d={`m 30 0 c 0 ${ch} ${cw*2} ${ch} ${cw*2} ${ch*2}`}
          stroke={edgeColor} stroke-width="2px" fill="none"/>
</svg>
