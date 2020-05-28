<script>
    import Track from "./track/Track.svelte";
    import GenerationOptions from "./generationOptions/GenerationOptions.svelte";
    import TrackControls from "./track/TrackControls.svelte";
    import TreeVis from "./treeVis/TreeVis.svelte";
    import Modal from "svelte-simple-modal";
    import ModalController from "./modals/ModalController.svelte";
    import colorLookup from "./colors";
    import {splitStore} from "./state/settings";
    import {togglePlayback} from "./audio/audioPlayer";
    import {undoStore} from "./state/undo";

    function keyPressed(event) {
        if(event.key === " ") {
            togglePlayback();
        } else if(event.key === "z") {
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
    <ModalController/>
    <div class="grid" style={"color: " + colorLookup.text + "; grid-template-columns: " + $splitStore + "fr " + (100-$splitStore) + "fr " + " 300px"} on:keypress={keyPressed}>
        <div style={"grid-column: 1; grid-row: 1; min-height: 0;" + ($splitStore === 0 ? " display: none;" : "")}>
            <Track/>
        </div>
        <div style={"grid-column: 2; grid-row: 1; min-height: 0;" + ($splitStore === 100 ? " display: none;" : "")}>
            <TreeVis/>
        </div>
        <div style="grid-column: 1 / span 3; grid-row: 2; min-height: 0"><TrackControls/></div>
        <div style={`grid-column: 3; grid-row: 1; overflow-y: auto; overflow-x: hidden; display: flex; flex-direction: column; background-color: ${colorLookup.bgDark}; border-left: 1px solid ${colorLookup.border}`}>
            <GenerationOptions/>
        </div>
    </div>
</Modal>
