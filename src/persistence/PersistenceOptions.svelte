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

    const tt_text_style = "border: 1px solid " + colorLookup.border + "; background-color: " + colorLookup.bgLight;
</script>

<style>
    h1 {
        margin: 0;
        text-align: center;
    }

    .container {
        padding: 12px;
    }

    .grid {
        display: grid;
        grid-template-rows: 1fr 1fr;
        grid-template-columns: 1fr 1fr 1fr;
        place-items: center;
    }

    .dropdown-content {
        display: none;
        flex-direction: column;
        position: absolute;
    }

    .dropdown:hover .dropdown-content {
        display: flex;
    }

    .TT_trigger {
    }

    .TT_text {
        visibility: hidden;
        padding: 5px;
        font-weight: 400;
        font-size: 12px;
        margin-left: 12px;

        position: absolute;
        z-index: 1;
    }

    .TT_trigger:hover .TT_text {
        visibility: visible;
    }
</style>
<!--TODO export modal with more info-->
<div class="container" style={"color: " + colorLookup.textDark}>
    <h1 style={"color: " + colorLookup.text}>Save</h1>
    <div class="grid">
        <span class="TT_trigger">
            Tree
            <span class="TT_text" style={tt_text_style}>
                Save the raw encoding of when each note happens, for the entire tree.
                This lets you load the whole tree back into MuseTree at a later time.
            </span>
        </span>
        <FileInput fileTypes=".mst" handleFile={loadClicked}> Load</FileInput>
        <Button disabled={disallowSave} on:click={() => save(root)}> Save</Button>

        <span class="TT_trigger">
            Audio
            <span class="TT_text" style={tt_text_style}>
                Save an audio file that you can listen to or upload to other sites.
                You can also save/load MIDI files into MuseTree.
            </span>
        </span>
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
