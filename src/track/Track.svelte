<script>
    // import Timeline from "./Timeline.svelte";
    import TrackRowOptions from "./TrackRowOptions.svelte";
    import TrackCanvas from "./TrackCanvas.svelte";
    import {isScrollingStore} from "../state/settings";
    import {root} from "../state/trackTree";

    $: selectedChildStore_2 = root.selectedChildStore_2;
    $: selectedChildStore = $selectedChildStore_2;
</script>

<style>
    .container {
        overflow-y: scroll;
        background-color: black;
        height: 100%;
    }

    .placeholder {
        color: white;
        text-align: center;
    }
</style>

<div class="container" on:wheel={() => isScrollingStore.set(false)}>
<!--      <Timeline />-->
    {#if selectedChildStore === null}
        <p class="placeholder">Use the controls below to begin</p>
    {:else}
        <TrackCanvas branchStore={selectedChildStore} section={0} deselect="{() => root.select([])}"/>
    {/if}
</div>
<TrackRowOptions />
