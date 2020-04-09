<script>
    import {root} from "../state/trackTree";
    import {fade} from "svelte/transition";
    import TreeVisRow from "./TreeVisRow.svelte";
    import {configStore} from "../state/settings";
    import {request} from "../broker"

    $: branchState = $root;
    $: pendingLoad = branchState.pendingLoad;

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
</style>

<div class="column">
    <div
            on:mousedown={leftClick}
            class="node"
            transition:fade
    >
    </div>
    {#if pendingLoad > 0}
        <span class="pendingLoad" transition:fade>
                +{pendingLoad}
        </span>
    {/if}
    <TreeVisRow parentStore={root} center={false}/>
</div>