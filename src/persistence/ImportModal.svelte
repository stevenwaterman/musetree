<script>
    import {getContext} from "svelte";
    import Button from "../buttons/Button.svelte";
    import FileInput from "../buttons/FileInput.svelte";
    import {fromMidi} from "musenet-midi";
    import {encodingToArray, encodingToString} from "../state/encoding";
    import {root} from "../state/trackTree";
    import {createSectionStore} from "../state/section";
    import {createSectionFromEncoding, isLoadingStore} from "./persistence";
    import colorLookup from "../colors";
    import examples from "./examples";

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

    .row {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .encoding {
        width: 100%;
        height: 300px;
        scrollbar-color: #c3cee3 #1f292e;
        resize: none;
        margin: 0;
    }

    .encoding::-webkit-scrollbar {
        width: 10px;
    }

    .encoding::-webkit-scrollbar-track {
        background: #1f292e;
    }

    .encoding::-webkit-scrollbar-thumb {
        background-color: #c3cee3;
    }

    .spread {
        flex-grow: 1;
    }
</style>
<!--TODO provide a guide like MrCheeze's-->
    <h1 style={"color: " + colorLookup.text}>Import</h1>

    <div class="row">
        <span class="spread">What to import:</span>
        <div class="spread">
            <FileInput fileTypes=".mid" handleFile={midiSelected}>Upload Midi</FileInput>
        </div>
        <div class="spread row">
            <label for="example" style="margin-right: 12px;">Examples:</label>
            <select id="example" bind:value={encoding} style={`margin: 0; width: 200px; background-color: ${colorLookup.buttonBg}; border-color: ${colorLookup.border}; color: ${colorLookup.textDark}`}>
                <option selected></option>
                {#each Object.entries(examples) as [name, exampleEncoding]}
                    <option value={exampleEncoding}>{name}</option>
                {/each}
            </select>
        </div>
    </div>


    <label for="encoding" style="display: none">Encoding</label>
    <textarea id="encoding" class="encoding" bind:value={encoding} on:drop|preventDefault={event => midiSelected(event.dataTransfer.files[0])} placeholder="MuseNet Encoding" style={"border: 1px dotted " + colorLookup.border + "; background-color: " + colorLookup.bgDark + "; color: " + colorLookup.textDark}></textarea>

    <div class="row">
        <span>Where to put it:</span>
        <Button disabled={encoding === ""} on:click={placeUnderRoot}>Under root</Button>
        <Button disabled={selectedState === undefined || encoding === ""} on:click={placeUnderSelected}>Under selected</Button>
    </div>
