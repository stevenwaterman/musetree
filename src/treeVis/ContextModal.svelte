<script>
    import {contextModalStore} from "./ContextModalStore";
    import {getContext} from "svelte";
    import ImportModal from "../persistence/ImportModal.svelte";
    import ExportModal from "../persistence/ExportModal.svelte";
    import Button from "../buttons/Button.svelte";
    import {configStore} from "../state/settings";
    import colorLookup, {modalOptions} from "../colors";
    import {request} from "../broker";

    $: contextModalState = $contextModalStore;

    $: coordinates = contextModalState === null ? null : contextModalState.coordinates;
    $: left = coordinates === null ? null : coordinates[0] - 40;
    $: top = coordinates === null ? null : coordinates[1] - 40;

    $: showRoot = contextModalState !== null && contextModalState.stores.type === "root";
    $: showBranch = contextModalState !== null && contextModalState.stores.type === "branch";

    $: parentStore = showBranch ? contextModalState.stores.parentStore : null;
    $: nodeStore = contextModalState === null ? null : contextModalState.stores.nodeStore;
    $: nodeState = nodeStore === null ? null : $nodeStore;
    $: children = nodeState === null ? null : nodeState.children;
    $: path = nodeState === null ? null : nodeState.path;
    $: childIndex = path === null ? null : path[path.length - 1];

    const {open} = getContext("simple-modal");

    function hide() {
        contextModalStore.set(null);
    }

    function loadMore() {
        hide();
        request($configStore, nodeStore, nodeState);
    }

    function deleteAll() {
        hide();
        Object.entries(children).map(pair => pair[0]).forEach(idx => nodeStore.deleteChild(idx));
    }

    function deleteBranch() {
        hide();
        parentStore.deleteChild(childIndex);
    }

    function openImportModal() {
        hide();
        open(ImportModal, {
            importUnderStore: nodeStore
        }, modalOptions);
    }

    function openExportModal() {
        hide();
        open(ExportModal, {
            store: nodeStore
        }, modalOptions);
    }
</script>

<style>
    .container {
        position: fixed;
        z-index: 2;
        inset: 0;
        pointer-events: none;
    }

    .contextModal {
        position: absolute;
        display: flex;
        flex-direction: column;
        margin: 25px;
        width: 150px;
        pointer-events: all;
        padding: 4px;
    }
</style>

<div class="container">
    {#if showRoot}
            <div
                    class="contextModal"
                    style={"background-color: " + colorLookup.bgDark + "; border: 1px solid " + colorLookup.border + "; color: " + colorLookup.textDark + "; left: " + left + "px; top: " + top + "px"}
                    on:mouseleave={hide}
                    on:mousedown|preventDefault|stopPropagation
                    on:contextmenu|preventDefault|stopPropagation
            >
                <Button on:click={loadMore}>Load More</Button>
                <Button on:click={openImportModal}>Import</Button>
                <Button on:click={deleteAll}>Delete All</Button>
            </div>
    {/if}

    {#if showBranch}
        <div class="contextModalContainer" on:mouseleave={hide}
             style={"left: " + left + "px; top: " + top + "px"}>
            <div
                    class="contextModal"
                    style={"background-color: " + colorLookup.bgDark + "; border: 1px solid " + colorLookup.border + "; color: " + colorLookup.textDark + "; left: " + left + "px; top: " + top + "px"}
                    on:mousedown|preventDefault|stopPropagation
                    on:contextmenu|preventDefault|stopPropagation
            >
                <Button on:click={loadMore}>Load More</Button>
                <Button on:click={openImportModal}>Import</Button>
                <Button on:click={openExportModal}>Export</Button>
                <Button on:click={deleteBranch}>Delete Branch</Button>
                <!--         TODO   <Button>Edit</Button>-->
            </div>
        </div>
    {/if}
</div>