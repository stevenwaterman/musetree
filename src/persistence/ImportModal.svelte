<script>
    import {getContext} from "svelte";
    import Button from "../buttons/Button.svelte";
    import FileInput from "../buttons/FileInput.svelte";
    import {fromMidi} from "musenet-midi";
    import {encodingToArray, encodingToString} from "../state/encoding";
    import {root} from "../state/trackTree";
    import {createSectionStore} from "../state/section";
    import {createSectionFromEncoding, isLoadingStore} from "./persistence";

    const {close} = getContext("simple-modal");

    let encoding = "";

    async function midiSelected(file) {
        const encodingArray = await fromMidi(file)
        encoding = encodingToString(encodingArray);
    }

    $: selectedStore_2 = root.selectedStore_2;
    $: selectedStore = $selectedStore_2;
    $: selectedState = $selectedStore;

    async function placeUnderSelected() {
        close();
        isLoadingStore.set(true);
        const encodingArray = encodingToArray(encoding);
        const endsAt = selectedState.section.endsAt;
        const section = await createSectionFromEncoding(encodingArray, endsAt)
        const sectionStore = createSectionStore(section);
        await selectedStore.addChild(sectionStore);
        isLoadingStore.set(false);
    }

    async function placeUnderRoot() {
        close();
        isLoadingStore.set(true);
        const encodingArray = encodingToArray(encoding);
        const section = await createSectionFromEncoding(encodingArray, 0);
        const sectionStore = createSectionStore(section);
        await root.addChild(sectionStore);
        isLoadingStore.set(false);
    }
</script>

<style>
    h1 {
        margin-top: 0;
    }

    h2 {
        display: inline;
    }

    .TT_trigger {
    }

    .TT_text {
        visibility: hidden;
        border: 1px solid black;
        background-color: white;
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

    .row {
        display: flex;
        flex-direction: row;
    }

    .encoding {
        width: 100%;
        height: 300px;
    }
</style>

<div>
    <h1>Import</h1>

    <FileInput fileTypes=".mid" handleFile={midiSelected}>Select Midi</FileInput>
    <label for="encoding" style="display: none">Encoding</label>
    <textarea id="encoding" class="encoding" bind:value={encoding} placeholder="MuseNet Encoding"></textarea>

    <div class="row">
        <Button on:click={placeUnderSelected}>Under selected</Button>
        <Button on:click={placeUnderRoot}>Under root</Button>
    </div>
</div>