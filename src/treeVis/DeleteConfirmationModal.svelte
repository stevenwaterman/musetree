<script>
    import Button from "../buttons/Button.svelte";
    import {root} from "../state/trackTree";
    import {undoStore} from "../state/undo";
    import {getContext} from "svelte";
    import colorLookup from "../colors";

    $: rootState = $root;
    $: childrenMap = rootState.children;
    $: children = Object.entries(childrenMap);

    function deleteEverything() {
        children.map(pair => pair[0]).forEach(root.deleteChild);
        undoStore.clear();
        close();
    }

    const {close} = getContext("simple-modal");
</script>

<style>
    h1 {
        margin-top: 0;
    }
</style>

<div style="display: flex; flex-direction: column; align-items: center">
    <h1 style={"color: " + colorLookup.text}>Warning!</h1>
    <span>You are about to delete everything. This cannot be undone!</span>
    <span style="margin: 8px">Are you sure?</span>

    <div style="display: flex; flex-direction: row; justify-content: space-around">
        <Button on:click={close}>Cancel</Button>
        <Button on:click={deleteEverything}>I'm Sure!</Button>
    </div>
</div>



