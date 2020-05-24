<script>
    import Track from "./track/Track.svelte";
    import GenerationOptions from "./generationOptions/GenerationOptions.svelte";
    import PersistenceOptions from "./persistence/PersistenceOptions.svelte";
    import TrackControls from "./track/TrackControls.svelte";
    import TreeVis from "./treeVis/TreeVis.svelte";
    import Links from "./links/Links.svelte";
    import Modal from "svelte-simple-modal";
    import ModalController from "./modals/ModalController.svelte";
    import colorLookup from "./colors";
    import SectionControls from "./track/SectionControls.svelte";
    import {splitStore} from "./state/settings";
</script>

<style>
    .grid {
        display: grid;
        grid-template-rows: 1fr auto 50px;
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
    <div class="grid" style={"color: " + colorLookup.text + "; grid-template-columns: " + $splitStore + "fr " + (100-$splitStore) + "fr " + " 300px"}>
        <div style={"grid-column: 1; grid-row: 1; min-height: 0;" + ($splitStore === 0 ? " display: none;" : "")}>
            <Track/>
        </div>
        <div style={"grid-column: 1; grid-row: 2; min-height: 0;" + ($splitStore === 0 ? " display: none;" : "")}>
            <SectionControls/>
        </div>
        <div style={"grid-column: 2; grid-row: 1 /span 2; min-height: 0;" + ($splitStore === 100 ? " display: none;" : "")}>
            <TreeVis/>
        </div>
        <div style="grid-column: 1 / span 2; grid-row: 3; min-height: 0"><TrackControls/></div>
        <div style={`grid-column: 3; grid-row: 1 / span 3; display: flex; flex-direction: column; background-color: ${colorLookup.bgDark}; border-left: 1px solid ${colorLookup.border}`}>
            <GenerationOptions/>
            <PersistenceOptions/>
            <Links/>
        </div>
    </div>
</Modal>
