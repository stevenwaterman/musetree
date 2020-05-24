<script>
    import SectionRowOptions from "./SectionControls.svelte";
    import SectionCanvas from "./SectionCanvas.svelte";
    import {isScrollingStore} from "../state/settings";
    import {root} from "../state/trackTree";
    import Timeline from "./Timeline.svelte";
    import colorLookup from "../colors";

    $: selectedChildStore_2 = root.selectedChildStore_2;
    $: selectedChildStore = $selectedChildStore_2;
</script>

<style>
    .container {
        overflow-y: scroll;
        scrollbar-color: #c3cee3 #1f292e;
        height: 100%;
        display:flex;
        flex-direction: column;
    }

    ::-webkit-scrollbar {
        width: 10px;
    }

    ::-webkit-scrollbar-track {
        background: #1f292e;
    }

    ::-webkit-scrollbar-thumb {
        background-color: #c3cee3;
    }

    .placeholder {
        text-align: center;
    }
</style>

<div class="container" on:wheel={() => isScrollingStore.set(false)} style={"background-color: " + colorLookup.bgDark}>
    <Timeline/>
    {#if selectedChildStore === null}
        <p class="placeholder">Use the controls below to begin</p>
    {:else}
        <SectionCanvas branchStore={selectedChildStore} index={0} deselect="{() => root.select([])}"/>
    {/if}
</div>
