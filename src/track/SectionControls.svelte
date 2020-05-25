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
    import ExportModal from "../persistence/ExportModal.svelte";
    import {getContext} from "svelte";
    import {downloadMidiAudio, downloadMuseNetAudio, downloadMuseTreeAudio} from "../persistence/export";

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

    function openExportModal() {
        open(ExportModal, {}, modalOptions);
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
        <Button disabled={disallowExport} on:click={openExportModal}>Export</Button>
    </div>
</div>
