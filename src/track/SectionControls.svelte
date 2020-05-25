<script>
    import {root, selectedBranchStore, selectedSectionsStore, selectedEncodingStore} from "../state/trackTree";

    import ChildButton from "./ChildButton.svelte";
    import {configStore} from "../state/settings";
    import {request} from "../broker";
    import {createSectionStore} from "../state/section";

    import {decode} from "../audio/decoder";
    import Button from "../buttons/Button.svelte";
    import colorLookup, {modalOptions} from "../colors";
    import ImportModal from "../persistence/ImportModal.svelte";
    import {getContext} from "svelte";
    import {downloadMidiAudio, downloadMuseNetAudio, downloadMuseTreeAudio} from "../audio/export";

    $: selectedStore_2 = root.selectedStore_2;
    $: selectedStore = $selectedStore_2;

    $: nodeStore = selectedStore == null ? root : selectedStore;
    $: nodeState = $nodeStore;
    $: children = nodeState.children;

    $: selectedPath = nodeState.path;
    $: lastSelectedChild = nodeState.lastSelected;
    $: pendingLoad = nodeState.pendingLoad;

    function loadMore() {
        if (nodeState === null) return;
        return request($configStore, nodeStore, nodeState);
    }

    const {open} = getContext("simple-modal");

    function openImportModal() {
        open(ImportModal, {}, modalOptions)
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

    $: parentStore = selectedStore == null ? root : selectedStore;
</script>

<style>
    .buttonRow {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        flex-grow: 0;
        flex-shrink: 0;
        justify-content: center;
    }

    .dropdown {
        display: inline-flex;
        flex-direction: row;
    }

    .dropdown-content {
        display: none;
        flex-direction: column;
        position: absolute;
    }

    .dropdown:hover .dropdown-content {
        display: flex;
        flex-direction: row;
    }
</style>

<div class="buttonRow"
     style={"background-color: " + colorLookup.bgDark + "; color: " + colorLookup.textDark + "; border-top: 1px solid " + colorLookup.border}>
    {#each Object.entries(children) as [childIdx, childStore]}
        <ChildButton nodeStore={childStore} remove={() => parentStore.deleteChild(childIdx)}/>
    {/each}
    <div>
        <Button on:click={loadMore}>
            Load More{pendingLoad ? ` (${pendingLoad} pending)` : ''}
        </Button>
        <Button on:click={openImportModal}>Import</Button>
        <Button
                on:click="{() => {{
      console.log(nodeState.section.endsAt);
      console.log(JSON.stringify(nodeState.section.notes));
      console.log(decode(nodeState.encoding));
    }}}">
            Log
        </Button>
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
