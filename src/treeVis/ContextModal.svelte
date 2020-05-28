<script>
    import {contextModalStore} from "./ContextModalStore";
    import {getContext, afterUpdate} from "svelte";
    import ImportModal from "../persistence/ImportModal.svelte";
    import ExportModal from "../persistence/ExportModal.svelte";
    import Button from "../buttons/Button.svelte";
    import {configStore} from "../state/settings";
    import colorLookup, {modalOptions} from "../colors";
    import {request} from "../broker";
    import {undoStore} from "../state/undo";
    import DeleteConfirmationModal from "./DeleteConfirmationModal.svelte";

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

    function openDeleteModal() {
        hide();
        open(DeleteConfirmationModal, {}, modalOptions);
    }

    function deleteBranch() {
        hide();
        parentStore.deleteChildWithUndo(childIndex);
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

    function keyPressed(event) {
        if(event.key === "r") return loadMore();
        if(event.key === "a") return openImportModal();
        if(event.key === "s" && showBranch) return openExportModal();
        if(event.key === "d" && showRoot) return openDeleteModal();
        if(event.key === "d" && showBranch) return deleteBranch();
    }

    let rootContainer;
    let branchContainer;

    afterUpdate(() => {
        if(rootContainer) rootContainer.focus();
        if(branchContainer) branchContainer.focus();
    })
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
        outline: none;
    }
</style>

<div class="container">
    {#if showRoot}
            <div
                    class="contextModal"
                    style={"background-color: " + colorLookup.bgDark + "; border: 1px solid " + colorLookup.border + "; color: " + colorLookup.textDark + "; left: " + left + "px; top: " + top + "px"}
                    bind:this={rootContainer}
                    on:mouseleave={hide}
                    on:mousedown
                    on:contextmenu|preventDefault|stopPropagation
                    on:keydown={keyPressed}
                    tabindex={0}
            >
                <Button on:click={loadMore}><u>R</u>equest More</Button>
                <Button on:click={openImportModal}><u>A</u>dd Midi</Button>
                <Button on:click={openDeleteModal}><u>D</u>elete All</Button>
            </div>
    {/if}

    {#if showBranch}
        <div class="contextModalContainer" on:mouseleave={hide}
             style={"left: " + left + "px; top: " + top + "px"}>
            <div
                    class="contextModal"
                    style={"background-color: " + colorLookup.bgDark + "; border: 1px solid " + colorLookup.border + "; color: " + colorLookup.textDark + "; left: " + left + "px; top: " + top + "px"}
                    bind:this={branchContainer}
                    on:mousedown|preventDefault|stopPropagation
                    on:contextmenu|preventDefault|stopPropagation
                    on:keydown={keyPressed}
                    tabindex={0}
            >
                <Button on:click={loadMore}><u>R</u>equest More</Button>
                <Button on:click={openImportModal}><u>A</u>dd Midi</Button>
                <Button on:click={openExportModal}><u>S</u>ave Audio</Button>
                <Button on:click={deleteBranch}><u>D</u>elete Branch</Button>
                <!--         TODO   <Button>Edit</Button>-->
            </div>
        </div>
    {/if}
</div>