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
    import ImportModal from "./ImportModal.svelte";
    import {getContext} from "svelte";
    import colorLookup, {modalOptions} from "../colors";

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

    const {open} = getContext("simple-modal");

    function openImportModal() {
        open(ImportModal, {}, modalOptions)
    }
</script>

<style>
    h1 {
        margin: 0;
    }

    .container {
        padding: 12px;
    }

    .grid {
        display: grid;
        grid-template-rows: 1fr 1fr;
        grid-template-columns: 1fr 1fr;
        place-items: center;
        width: 200px;
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

<div class="container" style={"color: " + colorLookup.textDark}>
    <h1>Save</h1>
    <div class="grid">
        <FileInput fileTypes=".mst" handleFile={loadClicked}> Load</FileInput>
        <Button disabled={disallowSave} on:click={() => save(root)}> Save</Button>
        <Button on:click={openImportModal}> Import</Button>
        <div class="dropdown">
            <Button disabled={disallowExport}>Export</Button>
            <div class="dropdown-content">
                <Button disabled={disallowExport} on:click={exportMuseTree}> MuseTree</Button>
                <Button disabled={disallowExport} on:click={exportMusenet}> MuseNet</Button>
                <Button disabled={disallowExport} on:click={exportMidi}> Midi</Button>
            </div>
        </div>
    </div>
</div>
