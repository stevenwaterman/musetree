<script>
    import {root} from "../state/trackTree";
    import {fade} from "svelte/transition";
    import {configStore} from "../state/settings";
    import {request} from "../broker"
    import TreeVisBranch from "./TreeVisBranch.svelte";

    $: branchState = $root;
    $: pendingLoad = branchState.pendingLoad;

    $: childStores = branchState.children;
    $: children = Object.entries(childStores);

    function leftClick(mouseEvent) {
        if (mouseEvent.button === 0) {
            if (mouseEvent.ctrlKey) {
                if (branchState !== null) {
                    request($configStore, root, branchState);
                }
            } else {
                root.select([]);
            }
        }
    }
</script>

<style>
.column {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.node {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 50px;
    height: 50px;
    margin: 10px;
    border-radius: 50%;

    cursor: pointer;
    background: red;
}

.pendingLoad {
    font-size: 18px;
    color: white;
}

.row {
    display: inline-flex;
    align-items: flex-start;
    justify-content: center;
    flex-direction: row;
    border-left: 1px solid white;

    border-top: 1px solid white;
    border-right: 1px solid white;
    border-top-left-radius: 25px;
    border-top-right-radius: 25px;
}
</style>

<div class="column" transition:fade>
    <div on:mousedown={leftClick} class="node"></div>
    {#if pendingLoad > 0}
        <span class="pendingLoad">
                +{pendingLoad}
        </span>
    {/if}
    <div class="row">
        {#each children as [index, child] (index)}
            <TreeVisBranch parentStore={root} branchStore={child}/>
        {/each}
    </div>
</div>