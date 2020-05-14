<script>
    import {downloadMidiAudio, downloadMuseNetAudio, downloadMuseTreeAudio} from "../audio/export"
    import {save, load, isLoadingStore} from "./persistence";
    import {
        root,
        selectedBranchStore,
        selectedEncodingStore,
        selectedSectionsStore,
    } from "../state/trackTree";
    import Button from "../buttons/Button.svelte";
    import FileInput from "../buttons/FileInput.svelte";

    const reader = new FileReader();
    reader.onload = async event => {
        await load(root, event.target.result);
        isLoadingStore.set(false);
    };

    function loadClicked(file) {
        isLoadingStore.set(true);
        reader.readAsText(file);
    }

    function exportMuseTree() {
        const track = $selectedSectionsStore;
        if (track === null) return;
        downloadMuseTreeAudio(track, "MuseTreeExport");
    }

    function exportMusenet() {
        const encoding = $selectedEncodingStore;
        if (encoding === null) return;
        downloadMuseNetAudio(encoding, "wav", "MuseNetExport")
    }

    function exportMidi() {
        const encoding = $selectedEncodingStore;
        if (encoding === null) return;
        downloadMidiAudio(encoding, "MidiExport");
    }

    $: disallowExport = $selectedBranchStore === null;
    $: disallowSave = Object.keys($root.children).length === 0;
</script>

<style>
    .container {
        padding: 12px;
    }

    .row {
        display: flex;
        flex-direction: row;
    }

    .dropdown-content {
        display: none;
        flex-direction: column;
        position: absolute;
    }

    .dropdown:hover .dropdown-content {
        display: flex;
    }

    button {
        margin: 4px;
    }
</style>

<div class="container">
    <h1>Save</h1>
    <div class="row">
        <FileInput fileTypes=".mst" handleFile={loadClicked}> Load </FileInput>
        <Button disabled={disallowSave} on:click={() => save(root)}> Save </Button>
    </div>
    <div class="row">
        <div class="dropdown">
            <Button disabled={disallowExport}>Export</Button>
            <div class="dropdown-content">
                <Button disabled={disallowExport} on:click={exportMuseTree}> MuseTree </Button>
                <Button disabled={disallowExport} on:click={exportMusenet}> MuseNet </Button>
                <Button disabled={disallowExport} on:click={exportMidi}> Midi </Button>
            </div>
        </div>
    </div>
</div>
