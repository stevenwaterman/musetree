<script>
    import {root} from "../state/trackTree";
    import {fade} from "svelte/transition";
    import TreeVisRow from "./TreeVisRow.svelte";

    export let parentStore;
    export let branchStore;

    $: branchState = $branchStore;
    $: pendingLoad = 0; //TODO
    $: path = branchState.path;
    $: childIndex = path[path.length - 1];

    function leftClick(mouseEvent) {
        if (mouseEvent.button === 0) {
            if (mouseEvent.ctrlKey) {
                //TODO
            } else {
                root.select(path);
            }
        }
    }

    function rightClick() {
        parentStore.deleteChild(childIndex);
    }

    function loadMore() {
        // return request($configStore, encoding, endsAt)
        //     .then(tracks => trackTreeStore.addTracks(pathCapture, tracks))
        //     .finally(_ => trackTreeStore.requestDone(pathCapture));
    }

    $: onSelectedPath = branchState.onSelectedPath;
    $: selectedByParent = branchState.selectedByParent;
    $: nodeColor = onSelectedPath ? "#f00" : selectedByParent ? "#f90" : "#fff";
</script>

<style>
.label {
    font-size: 30px;
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

.column {
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>

<!--<g fill="none" stroke-opacity="0.4" stroke-width="1.5">-->
<!--    <path d={link.d} stroke={link.color} transition:fade></path>-->
<!--</g>-->
<div class="column">
    <div
            on:mousedown={leftClick}
            on:contextmenu|preventDefault={rightClick}
            class="node"
            style={"background-color: " + nodeColor + ";"}
            transition:fade
    >
        <span class="label" transition:fade>
            {childIndex}
        </span>
    <!--    {#if pendingLoad > 0}-->
    <!--        <text-->
    <!--                class="label"-->
    <!--                dy="2.31em"-->
    <!--                text-anchor="middle"-->
    <!--                fill="white"-->
    <!--                transition:fade>-->
    <!--            +{pendingLoad * 4}-->
    <!--        </text>-->
    <!--    {/if}-->
    </div>
    <TreeVisRow parentStore={branchStore} center={false}/>
</div>