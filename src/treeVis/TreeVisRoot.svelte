<script>
    import {root} from "../state/trackTree";
    import TreeVisBranch from "./TreeVisBranch.svelte";
    import colorLookup from "../colors";
    import {get_store_value} from "svelte/internal";
    import {contextModalStore} from "./ContextModalStore";

    $: branchState = $root;
    $: pendingLoad = branchState.pendingLoad;

    $: childStores = branchState.children;
    $: children = Object.entries(childStores);

    function leftClick(event) {
        if(event.button === 0) root.select([]);
    }

    $: numberOfLeavesStore = root.numberOfLeavesStore;
    $: numberOfLeaves = $numberOfLeavesStore;

    function getChildPlacements(children, numberOfLeaves) {
        const childPlacements = [];
        let currOffset = -(numberOfLeaves) / 2;

        children.forEach(([idx, child]) => {
            const width = get_store_value(child.numberOfLeavesStore);
            childPlacements.push([idx, child, currOffset + (width / 2)]);
            currOffset += width;
        });

        return childPlacements;
    }

    function rightClick({clientX, clientY}) {
        contextModalStore.set({
            coordinates: [clientX, clientY],
            stores: {
                type: "root",
                nodeStore: root
            }
        });
    }

    $: childPlacements = getChildPlacements(children, numberOfLeaves);
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
    }


</style>
{#if childPlacements.length > 0}
    {#each childPlacements as [index, child, offset] (index)}
        <TreeVisBranch parentStore={root} branchStore={child} depth={1} offset={offset} parentOffset={0}/>
    {/each}
{/if}
<div class="placement">
    <div on:mousedown={leftClick} on:contextmenu|preventDefault={rightClick} class="node"
         style={"background-color: " + colorLookup.nodeActive}>
        <span class="label">
            Root
        </span>
    </div>
    {#if pendingLoad > 0}
        <p class="pendingLoad" style={"color: " + colorLookup.textDark + "; background-color: " + colorLookup.bgDark + "; border: 2px solid " + colorLookup.border}>
                +{pendingLoad}
        </p>
    {/if}
</div>

