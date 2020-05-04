<script>
    import {downloadMuseNetAudio, downloadMuseTreeAudio} from "../broker";
    import download from "downloadjs";
    import {
        root,
        selectedBranchStore,
        selectedEncodingStore,
        selectedSectionsStore,
    } from "../state/trackTree";

    function save() {
        // download(JSON.stringify($trackTreeStore), "save.json");
    }

    const reader = new FileReader();
    reader.onload = event => {
        // trackTreeStore.set(JSON.parse(event.target.result));
    };

    function load(event) {
        // reader.readAsText(event.target.files[0]);
    }

    function exportMuseTree() {
        const track = $selectedSectionsStore;
        if(track === null) return;
        downloadMuseTreeAudio(track, "MuseTreeExport");
    }

    function exportMusenet() {
        const encoding = $selectedEncodingStore;
        if(encoding === null) return;
        downloadMuseNetAudio(encoding, "wav", "MuseNetExport")
    }

    function exportMidi() {

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
                on:click={save}>
            Save
        </button>
        <label for="upload">
            <span>Load</span>
            <input
                    id="upload"
                    type="file"
                    accept=".json"
                    multiple={false}
                    on:change={load}
                    style="display:none"/>
        </label>
        <div class="dropdown">
            <button disabled={disallowExport} class="dropbtn">Export</button>
            <div class="dropdown-content">
                <button disabled={disallowExport} on:click={exportMuseTree}>
                    MuseTree
                </button>
                <button disabled={disallowExport} on:click={exportMusenet}>
                    MuseNet (High Quality)
                </button>
                <button disabled={disallowExport} on:click={exportMidi}>
                    Midi
                </button>
            </div>
        </div>
    </div>
</div>
