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
</script>

<style>
    .columns {
        display: grid;
        grid-template-columns: 1fr 1fr 300px;
        grid-template-rows: auto;
        width: 100vw;
        height: 100vh;
    }

    .col {
        display: flex;
        flex-direction: column;
        height: 100vh;
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
    <div class="columns" style={"color: " + colorLookup.text}>
        <div class="col" style={"background-color: " + colorLookup.bgDark}>
            <Track/>
            <TrackControls/>
        </div>
        <div class="col">
            <TreeVis/>
        </div>
        <div class="col" style={"background-color: " + colorLookup.bgDark + "; border-left: 1px solid " + colorLookup.border}>
            <GenerationOptions/>
            <PersistenceOptions/>
            <Links/>
        </div>
    </div>
</Modal>
