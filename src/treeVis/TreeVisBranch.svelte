<script lang="ts">
    import {root, toReadableNodeState} from "../state/trackTree";
    import type {NodeStore, BranchStore, BranchState, NodeState, TreeStore} from "../state/trackTree";
    import {configStore} from "../state/settings";
    import {request} from "../broker"
    import colorLookup, {modalOptions} from "../colors";
    import ImportModal from "../persistence/ImportModal.svelte";
    import ExportModal from "../persistence/ExportModal.svelte";
    import {getContext, onMount} from "svelte";
    import Button from "../buttons/Button.svelte";
    import {contextModalStore} from "./ContextModalStore";
    import {audioStatusStore} from "../audio/audioPlayer";
    import type {AudioStatus_On} from "../audio/audioPlayer";
    import {create_in_transition, create_out_transition, get_store_value} from "svelte/internal";
    import {play} from "../audio/audioPlayer";
    import type {Section} from "../state/section";
    import type {Readable} from "svelte/store"

    export let parentStore: NodeStore;
    export let branchStore: BranchStore;
    export let depth: number;
    export let offset: number;
    export let parentOffset: number;
    export let treeContainer: HTMLDivElement;

    let convertedParentStore: Readable<NodeState>;
    $: convertedParentStore = toReadableNodeState(parentStore);

    let parentState: NodeState;
    $: parentState = $convertedParentStore;

let branchState: BranchState;
    $: branchState= $branchStore;

    let path: number[];
    $: path = branchState.path;

    let childIndex: number;
    $: childIndex = path[path.length - 1];

    let pendingLoad: number;
    $: pendingLoad= branchState.pendingLoad;

    let section: Section;
    $: section= branchState.section;

    let startsAt: number;
    $: startsAt= section.startsAt;

    let endsAt: number;
    $: endsAt = section.endsAt;

    let duration: number;
    $: duration = endsAt - startsAt;

    let childStores: Record<number, BranchStore>;
    $: childStores = branchState.children;

    let children: Array<[number, BranchStore]>;
    $: children = Object.entries(childStores).map(([idx, store]) => [parseInt(idx), store]);

    function leftClick(event: MouseEvent) {
        if (event.button === 0) root.select(path);
    }

    function rightClick({clientX, clientY}: MouseEvent) {
        contextModalStore.set({
            coordinates: [clientX, clientY],
            stores: {
                type: "branch",
                parentStore: parentStore,
                nodeStore: branchStore
            }
        })
    }

let onSelectedPath: boolean;
    $: onSelectedPath = branchState.onSelectedPath;

    let selectedByParent: boolean;
    $: selectedByParent = branchState.selectedByParent;

    let wasLastSelected: boolean;
    $: wasLastSelected = branchState.wasLastSelectedByParent;

    let trackPlaying: boolean = false;
    let sectionPlaying: boolean = false;
    let edgeProgress: number = 0;

    let nodeColor: string;
    $: nodeColor = onSelectedPath ? (sectionPlaying ? colorLookup.nodePlaying : colorLookup.nodeActive) : (selectedByParent || (wasLastSelected && parentState.onSelectedPath)) ? colorLookup.nodeWarm : colorLookup.nodeInactive;

let edgeColor: string;
    $: edgeColor = onSelectedPath ? (sectionPlaying ? colorLookup.edgePlaying : colorLookup.edgeActive) : (selectedByParent || (wasLastSelected && parentState.onSelectedPath)) ? colorLookup.edgeWarm : colorLookup.edgeInactive;

    let edgePercentage: number;
    $: edgePercentage = sectionPlaying ? 100 : trackPlaying ? edgeProgress : 0;

    let opacity: number;
    $: opacity= (onSelectedPath && trackPlaying) ? 25 : 100;
    
    let edgeZ: number;
    $: edgeZ = (onSelectedPath) ? 1 : 0;

    let numberOfLeavesStore: Readable<number>;
    $: numberOfLeavesStore = branchStore.numberOfLeavesStore;

    let numberOfLeaves: number;
    $: numberOfLeaves = $numberOfLeavesStore;

let placementOffset: number;
    $: placementOffset= offset + (-numberOfLeaves / 2);

    let placementStore: Readable<Array<[number, number]>>;
    $: placementStore = branchStore.placementStore;

    let childPlacements: Array<[number, number]>;
    $: childPlacements = $placementStore

    let offsetWidth: number;
    $: offsetWidth = Math.abs(parentOffset - offset);

    let cw: number;
    $: cw = offsetWidth * 30;

    let ch :number;
    $: ch= 150 / 2;

    let lineWidth: number;
    $: lineWidth = (offsetWidth) * 60 + 10;

    let lineLeft: number;
    $: lineLeft = Math.min(offset, parentOffset) * 60 - 5;

    let node: HTMLDivElement| undefined;
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

    function keyPressed(event: KeyboardEvent) {
        if(event.key === "r") return loadMore();
        if(event.key === "a") return openImportModal();
        if(event.key === "s") return openExportModal();
        if(event.key === "d") return deleteBranch();
    }

    function createNodeTransition(node: Element, {offset}: AudioStatus_On) {
        return {
            delay: Math.max(0, (endsAt - offset) * 1000),
            duration: 0,
            tick: (t: number) => {
                if(t === 0){
                    sectionPlaying = false;
                } else {
                    sectionPlaying = true;
                }
            }
        };
    }

    function createEdgeTransition(node: Element, {offset}: AudioStatus_On) {
        const delay: number = Math.max(0, (startsAt - offset) * 1000);
        const duration: number = (endsAt - Math.max(startsAt, offset)) * 1000;
        const startProgressSeconds: number = Math.max(0, offset - startsAt);
        const startProgress: number = startProgressSeconds / (endsAt - startsAt);
        const progressToGo: number = 1 - startProgress;

        return {
            delay: delay,
            duration: duration,
            tick: (t: number) => {
                const progress: number = startProgress + (progressToGo * t);
                edgeProgress = progress * 100;
            }
        };
    }

    let edgeGradient: SVGLinearGradientElement & HTMLElement | undefined;

    let nodeTransition: {
        start: () => void;
        invalidate: () => void;
        end: () => void;
    } | undefined;
    let edgeTransition: {
        start: () => void;
        invalidate: () => void;
        end: () => void;
    } | undefined;

    audioStatusStore.subscribe(status => {
        if(node && edgeGradient) {
            if (nodeTransition) nodeTransition.end();
            if(edgeTransition) edgeTransition.end();
            trackPlaying = false;
            sectionPlaying = false;

            if (onSelectedPath && status.type === "on") {
                trackPlaying = true;
                edgeProgress = 0;

                nodeTransition = create_in_transition(node, createNodeTransition, status);
                nodeTransition.start();

                edgeTransition = create_in_transition(edgeGradient, createEdgeTransition, status);
                edgeTransition.start();
            }
        }
    });

    function clickedEdge(event: any) {
        //TODO don't use any
        if(!onSelectedPath) return;

        const clickX: number = event.layerX;
        const clickY: number = event.layerY;
        const width: number = event.target.viewportElement.clientWidth;
        const height: number = event.target.viewportElement.clientHeight;

        let progress: number;
        if(width === 10){
            progress = clickY / height;
        } else {
            const fullDistance: number = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
            const clickDistance: number = Math.sqrt(Math.pow(clickX, 2) + Math.pow(clickY, 2));
            progress = clickDistance / fullDistance;
        }
        play(startsAt + progress * duration);


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
        transition: transform .2s ease-in-out, background-color 0.2s ease-in-out, opacity 0.2s ease-in-out;
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
        z-index: 2;
    }

    path {
        transition: stroke 0.2s ease-in-out;
    }
</style>


<div class="placement" style={`top: ${150*depth}px; left: ${60*offset -25}px; ${opacity < 100 ? "pointer-events: none" : ""}`}>
    <div
            on:mousedown={leftClick}
            on:contextmenu|preventDefault={rightClick}
            on:mouseenter={focusNode}
            on:mouseleave={unfocusNode}
            on:keypress={keyPressed}
            bind:this={node}
            class="node"
            style={`background-color: ${nodeColor}; opacity: ${opacity}%`}
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
<svg class="line" width={lineWidth} height={ch * 2 + 2}
     style={{
         left: lineLeft,
         top: (depth-1) * ch * 2 + 24,
         transform: `scaleX(${offset < parentOffset ? -1 : 1})`,
         zIndex: edgeZ
     }}>
    <linearGradient bind:this={edgeGradient} id={`linear${depth},${offset}`} gradientUnits="userSpaceOnUse" x1="0%" y1="0%" x2={offset === parentOffset ? "0%" : "100%"} y2="100%">
        <stop offset="0%"   stop-color={colorLookup.edgePlaying}/>
        <stop offset={edgePercentage+"%"}   stop-color={colorLookup.edgePlaying}/>
        <stop offset={edgePercentage+"%"} stop-color={edgeColor}/>
    </linearGradient>
    <path d={`m 5 0 c 0 ${ch + 0.5} ${cw*2} ${ch + 0.5} ${cw*2} ${ch*2 + 1}`}
          stroke={`url(#linear${depth},${offset})`} stroke-width="6px" fill="none" style={{cursor: onSelectedPath ? "pointer" : "initial"}} on:click={clickedEdge}/>
</svg>
