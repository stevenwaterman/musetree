<script>
    import TreeVisBranch from "./TreeVisBranch.svelte";
    export let parentStore;
    $: parentState = $parentStore;
    $: childStores = parentState.children;
</script>

<style>
    .row {
        display: inline-flex;
        flex-direction: row;
        border-left: 1px solid white;
        border-top: 1px solid white;
        border-right: 1px solid white;
        border-top-left-radius: 25px;
        border-top-right-radius: 25px;
    }
</style>

{#if Object.keys(childStores).length > 0}
<div>
    <div class="row">
        {#each Object.entries(childStores) as [index, child] (index)}
            <TreeVisBranch parentStore={parentStore} branchStore={child}/>
        {/each}
    </div>
</div>
{/if}
