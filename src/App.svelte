<script lang="ts">
    import Track from "./track/Track.svelte";
    import GenerationOptions from "./options/generationOptions/GenerationOptions.svelte";
    import TrackControls from "./track/TrackControls.svelte";
    import TreeVis from "./treeVis/TreeVis.svelte";
    import Modal from "svelte-simple-modal";
    import ModalController from "./modals/ModalController.svelte";
    import colorLookup, {modalOptions} from "./colors";
    import {splitStore, showSidebarStore} from "./state/settings";
    import {togglePlayback} from "./audio/audioPlayer";
    import {undoStore} from "./state/undo";
    import AutoSaveController from "./persistence/AutoSaveController.svelte";
    import DisplayOptions from "./options/displayOptions/DisplayOptions.svelte";
    import TrackInfo from "./trackInfo/TrackInfo.svelte";

    function keyPressed(event: KeyboardEvent) {
        if (event.key === " ") {
            togglePlayback();
        } else if (event.key === "z") {
            undoStore.undo();
        }
    }
</script>

<style>
    .grid {
        display: grid;
        grid-template-rows: 1fr 46px;
        height: 100vh;
        width: 100vw;
    }

    :global(body) {
        padding: 0;
        margin: 0;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
    }

    :global(a) {
        color: #c3e88d
    }

    :global(a:active) {
        color: #c3e88d
    }

    :global(a:visited) {
        color: #c3e88d
    }
</style>

<Modal>
    <AutoSaveController/>
    <ModalController/>
    <div class="grid"
         style={`color: ${colorLookup.text}; grid-template-columns: ${$splitStore}fr ${100-$splitStore}fr ${$showSidebarStore ? "300px" : ""}`}
         on:keypress={keyPressed}>
        {#if !$showSidebarStore}
            <div style={`position: fixed; top: 0px; right: 8px; color: ${colorLookup.text}; font-size: 20pt; font-weight: 600; opacity: 50%; cursor: pointer; z-index: 999`}
                 on:click|capture="{() => showSidebarStore.set(true)}">
                &lt;
            </div>
        {/if}
        <div style={"grid-column: 1; grid-row: 1; min-height: 0;" + ($splitStore === 0 ? " display: none;" : "")}>
            <Track/>
        </div>
        <div style={`position: relative; grid-column: 2; grid-row: 1; min-height: 0;${$splitStore === 100 ? " display: none;" : ""}`}>
            <TreeVis/>
        </div>
        <div style="grid-column: 1 / span 3; grid-row: 2; min-height: 0">
            <TrackControls/>
        </div>
        {#if $showSidebarStore}
            <div style={`position: relative; grid-column: 3; grid-row: 1; overflow-y: auto; overflow-x: hidden; display: flex; flex-direction: column; background-color: ${colorLookup.bgDark}; border-left: 1px solid ${colorLookup.border}; padding: 12px`}>
                <div style={`position: absolute; top: 0px; left: 8px; color: ${colorLookup.text}; font-size: 20pt; font-weight: 600; opacity: 50%; cursor: pointer`}
                     on:click="{() => showSidebarStore.set(false)}">
                    &gt;
                </div>
                <h1 style={`text-align: center; color: ${colorLookup.text}; margin: 0`}>Options</h1>
                <GenerationOptions/>
                <DisplayOptions/>
                <TrackInfo/>
            </div>
        {/if}
    </div>
</Modal>
