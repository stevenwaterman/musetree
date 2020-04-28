<script>
    import {root} from "../state/trackTree";
    import {fade} from "svelte/transition";
    import {configStore} from "../state/settings";
    import {request} from "../broker"

    export let parentStore;
    export let branchStore;

    $: branchState = $branchStore;
    $: path = branchState.path;
    $: childIndex = path[path.length - 1];
    $: pendingLoad = branchState.pendingLoad;

    $: childStores = branchState.children;
    $: children = Object.entries(childStores);

    function leftClick(mouseEvent) {
        if (mouseEvent.button === 0) {
            if (mouseEvent.ctrlKey) {
                if (branchState !== null) {
                    request($configStore, branchStore, branchState);
                }
            } else {
                root.select(path);
            }
        }
    }

    function rightClick() {
        parentStore.deleteChild(childIndex);
    }

    $: onSelectedPath = branchState.onSelectedPath;
    $: selectedByParent = branchState.selectedByParent;
    $: nodeColor = onSelectedPath ? "#f00" : selectedByParent ? "#f90" : "#fff";
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
}

.label {
    font-size: 30px;
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
    <div
            on:mousedown={leftClick}
            on:contextmenu|preventDefault={rightClick}
            class="node"
            style={"background-color: " + nodeColor + ";"}
    >
        <span class="label" transition:fade>
            {childIndex}
        </span>
    </div>
    {#if pendingLoad > 0}
        <span class="pendingLoad">
                +{pendingLoad}
        </span>
    {/if}
    <div class="row">
        {#each children as [index, child] (index)}
            <svelte:self parentStore={branchStore} branchStore={child}/>
        {/each}
    </div>
</div>