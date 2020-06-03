<script>
    import {getContext} from "svelte";
    import Button from "../buttons/Button.svelte";
    import FileInput from "../buttons/FileInput.svelte";
    import {fromMidi} from "musenet-midi";
    import {encodingToArray, encodingToString} from "../state/encoding";
    import {root} from "../state/trackTree";
    import {loadMidi} from "./persistence";
    import colorLookup from "../colors";
    import examples from "./examples";

    const {close} = getContext("simple-modal");

    export let importUnderStore;
    $: importUnderState = $importUnderStore;
    $: sectionEndsAt = importUnderStore.type === "root" ? 0 : importUnderState.section.endsAt;

    let encoding = "";
    $: encodingArray = encodingToArray(encoding.trim());
    $: encodingInvalid = encodingArray.some(isNaN);

    async function midiSelected(file) {
        const encodingArray = await fromMidi(file)
        encoding = encodingToString(encodingArray);
    }

    async function importEncoding() {
        close();
        await loadMidi(encodingArray, sectionEndsAt, importUnderStore);
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
            <select id="example" bind:value={encoding} style={`margin: 0; width: 200px; background-color: ${colorLookup.bgLight}; border-color: ${colorLookup.border}; color: ${colorLookup.text}`}>
                <option selected></option>
                {#each Object.entries(examples) as [name, exampleEncoding]}
                    <option value={exampleEncoding}>{name}</option>
                {/each}
            </select>
        </div>
    </div>


    <label for="encoding" style="display: none">Encoding</label>
    <textarea id="encoding" class="encoding" bind:value={encoding} on:drop|preventDefault={event => midiSelected(event.dataTransfer.files[0])} placeholder="MuseNet Encoding" style={"border: 1px dotted " + colorLookup.border + "; background-color: " + colorLookup.bgLight + "; color: " + colorLookup.text}></textarea>

    <Button disabled={encodingInvalid} on:click={importEncoding}>Import</Button>
