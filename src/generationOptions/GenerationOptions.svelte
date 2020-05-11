<script>
    import {
        genreStore,
        generationLengthStore,
        instrumentStores,
        truncationStore,
        temperatureStore,
        autoRequestStore,
        autoScrollStore,
        yScaleStore
    } from "../state/settings";
    import InstrumentCheckbox from "./InstrumentCheckbox.svelte";
    import {genres, instrumentCategories} from "../constants";
    import {getContext} from "svelte";
    import GenresModal from "./GenresModal.svelte";
    import Button from "../buttons/Button.svelte";

    const {open} = getContext("simple-modal");

    function showGenreModal() {
        open(GenresModal, {}, {})
    }
</script>

<style>
    .options {
        padding: 12px;
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    .slider {
        width: 100px;
    }

    .optionElement {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    label {
        font-weight: 600;
        margin: 0 8px 0 0;
    }

    span {
        margin: 4px;
    }

    .header {
        margin: 0;
    }

    select {
        margin: 0;
    }

    input {
        margin: 0;
    }
</style>

<div class="options">
    <h1 class="header">Generator:</h1>

    <div class="optionElement">
        <label for="genre">Genre:</label>
        <span id="genre">{$genreStore[0]}</span>
        <Button on:click={showGenreModal} style="font-size: 24px; padding: 0 4px 0 4px; margin: 0 0 0 8px;">⚙</Button>
    </div>


    <div class="optionElement">
        <label for="generationlength">Generation Length:</label>
        <input
                class="slider"
                id="generationLength"
                bind:value={$generationLengthStore}
                type="range"
                min="20"
                max="1000"
                step="10"/>
        <span>{$generationLengthStore}</span>
    </div>

    <label>Instruments:</label>
    {#each instrumentCategories as instrument}
        <InstrumentCheckbox {instrument}/>
    {/each}

    <div class="optionElement">
        <label for="autoRequest">Auto Request</label>
        <input id="autoRequest" type="checkbox" bind:checked={$autoRequestStore}/>
    </div>
</div>
