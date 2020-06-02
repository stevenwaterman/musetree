<script>
    import {root} from "../state/trackTree";
    import {configStore} from "../state/settings";
    import {request} from "../broker"
    import colorLookup, {modalOptions} from "../colors";
    import ImportModal from "../persistence/ImportModal.svelte";
    import ExportModal from "../persistence/ExportModal.svelte";
    import {getContext, onMount} from "svelte";
    import Button from "../buttons/Button.svelte";
    import {contextModalStore} from "./ContextModalStore";
    import {audioStatusStore} from "../audio/audioPlayer";
    import {create_in_transition, create_out_transition, get_store_value} from "svelte/internal";


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
    $: section = branchState.section;
    $: startsAt = section.startsAt;
    $: endsAt = section.endsAt;
    $: duration = endsAt - startsAt;

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
    let trackPlaying = false;
    let sectionPlaying = false;
    let edgeProgress = 0;
    $: nodeColor = onSelectedPath ? (sectionPlaying? colorLookup.nodePlaying : colorLookup.nodeActive) : (selectedByParent || (wasLastSelected && $parentStore.onSelectedPath)) ? colorLookup.nodeWarm : colorLookup.nodeInactive;
    $: edgeColor = onSelectedPath ? (sectionPlaying ? colorLookup.edgePlaying : colorLookup.edgeActive) : (selectedByParent || (wasLastSelected && $parentStore.onSelectedPath)) ? colorLookup.edgeWarm : colorLookup.edgeInactive;
    $: edgePercentage = sectionPlaying ? 100 : trackPlaying ? edgeProgress : 0;

    $: numberOfLeavesStore = branchStore.numberOfLeavesStore;
    $: numberOfLeaves = $numberOfLeavesStore;
    $: placementOffset = offset + (-numberOfLeaves / 2);
    $: placementStore = branchStore.placementStore;
    $: childPlacements = $placementStore

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
        parentStore.deleteChildWithUndo(path[path.length - 1]);
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

    function createNodeTransition(node, {offset}) {
        return {
            delay: Math.max(0, (startsAt - offset) * 1000),
            duration: 0,
            tick: t => {
                if(t === 0){
                    sectionPlaying = false;
                } else {
                    sectionPlaying = true;
                }
            }
        };
    }

    function createEdgeTransition(node, {offset}) {
        const parentState = get_store_value(parentStore);
        const startsAt = parentState.section.startsAt;
        const endsAt = parentState.section.endsAt;
        const delay = Math.max(0, (startsAt - offset) * 1000);
        const duration = (endsAt - Math.max(startsAt, offset)) * 1000;
        const startProgress = Math.max(0, offset - startsAt);
        const progressToGo = 1 - startProgress;

        return {
            delay: delay,
            duration: duration,
            tick: t => {
                const progress = startProgress + (progressToGo * t);
                edgeProgress = progress * 100;
            }
        };
    }

    let edgeGradient;

    let nodeTransition;
    let edgeTransition;

    onMount(() => {
        audioStatusStore.subscribe(status => {
            if (nodeTransition) nodeTransition.end();
            if(edgeTransition) edgeTransition.end();
            trackPlaying = false;
            sectionPlaying = false;

            if (onSelectedPath && status.type === "on") {
                trackPlaying = true;
                edgeProgress = 0;

                nodeTransition = create_in_transition(node, createNodeTransition, status);
                nodeTransition.start();

                if(parentStore.type === "branch"){
                    edgeTransition = create_in_transition(edgeGradient, createEdgeTransition, status);
                    edgeTransition.start();
                }
            }
        });
    })

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
    {#each childPlacements as [idx, placement] (idx)}
        <svelte:self parentStore={branchStore} branchStore={childStores[idx]} depth={depth + 1} offset={placementOffset + placement} parentOffset={offset} treeContainer={treeContainer}/>
    {/each}
{/if}
<svg class="line" width={lineWidth} height={ch * 2}
     style={`left: ${lineLeft}px; top: ${(depth-1) * ch * 2 + 25}px;${offset < parentOffset ? "transform: scaleX(-1)" : ""}`}>
    <linearGradient bind:this={edgeGradient} id={`linear${depth},${offset}`} gradientUnits="userSpaceOnUse" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stop-color={colorLookup.edgePlaying}/>
        <stop offset={edgePercentage+"%"}   stop-color={colorLookup.edgePlaying}/>
        <stop offset={edgePercentage+"%"} stop-color={edgeColor}/>
    </linearGradient>
    <path d={`m 30 0 c 0 ${ch} ${cw*2} ${ch} ${cw*2} ${ch*2}`}
          stroke={`url(#linear${depth},${offset})`} stroke-width="2px" fill="none"/>
</svg>
