<script>
    import {downloadMidiAudio, downloadMuseNetAudio, downloadMuseTreeAudio} from "../audio/export"
    import {save, load} from "./persistence";
    import {
        root,
        selectedBranchStore,
        selectedEncodingStore,
        selectedSectionsStore,
    } from "../state/trackTree";

    const reader = new FileReader();
    reader.onload = async event => {
        await load(root, event.target.result);
        alert("Loading Complete");
    };

    function loadClicked(event) {
        reader.readAsText(event.target.files[0]);
    }

    function exportMuseTree() {
        const track = $selectedSectionsStore;
        if(track === null) return;
        downloadMuseTreeAudio(track, "MuseTreeExport");
    }

    function exportMusenet() {
        const encoding = $selectedEncodingStore;
        if(encoding === null) return;
        downloadMuseNetAudio(encoding, "mp3", "MuseNetExport")
    }

    function exportMidi() {
        const encoding = $selectedEncodingStore;
        if(encoding === null) return;
        downloadMidiAudio(encoding, "MidiExport");
    }

    $: disallowExport = $selectedBranchStore === null;
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
    <h1>Persistence</h1>
    <div class="row">
        <button
                disabled={$root.children.length === 0}
                on:click={() => save(root)}>
            Save
        </button>
        <label for="upload">
            <span>Load</span>
            <input
                    id="upload"
                    type="file"
                    accept=".mst"
                    multiple={false}
                    on:change={loadClicked}
                    style="display:none"/>
        </label>
        <div class="dropdown">
            <button disabled={disallowExport} class="dropbtn">Export</button>
            <div class="dropdown-content">
                <button disabled={disallowExport} on:click={exportMuseTree}>
                    MuseTree
                </button>
                <button disabled={disallowExport} on:click={exportMusenet}>
                    MuseNet
                </button>
                <button disabled={disallowExport} on:click={exportMidi}>
                    Midi
                </button>
            </div>
        </div>
    </div>
</div>
