<script>
    import TreeVisBranch from "./TreeVisBranch.svelte";
    export let parentStore;
    export let center;

    $: parentState = $parentStore;
    $: childStores = parentState.children;
</script>

<style>
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

    .center {
        transform: translateX(-50%);
    }
</style>

{#if Object.keys(childStores).length > 0}
        <div class="row" class:center>
        {#each Object.entries(childStores) as [index, child] (index)}
            <TreeVisBranch parentStore={parentStore} branchStore={child}/>
        {/each}
    </div>
{/if}
