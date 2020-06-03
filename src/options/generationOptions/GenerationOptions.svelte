<script>
    import {
        genreStore,
        generationLengthStore,
        maxResponseLengthStore,
        instrumentStores,
        truncationStore,
        temperatureStore,
        autoRequestStore,
        autoScrollStore,
        yScaleStore
    } from "../../state/settings";
    import InstrumentCheckbox from "../InstrumentCheckbox.svelte";
    import {genres, instrumentCategories} from "../../constants";
    import {getContext} from "svelte";
    import GenresModal from "./GenresModal.svelte";
    import Button from "../../buttons/Button.svelte";
    import colorLookup, {modalOptions} from "../../colors";
    import GenerationOptionsModal from "./GenerationOptionsModal.svelte";

    const {open} = getContext("simple-modal");

    function showGenreModal() {
        open(GenresModal, {}, modalOptions);
    }

    function showAdvancedModal() {
        open(GenerationOptionsModal, {}, modalOptions);
    }

    //TODO have a styled tooltip component that's reusable
    const tt_text_style = "border: 1px solid " + colorLookup.border + "; background-color: " + colorLookup.bgLight;
</script>

<style>
    .options {
        display: flex;
        flex-direction: column;
        width: 100%;
        margin-top: 12px;
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

    h1 {
        margin: 0;
        text-align: center;
        font-size: 20pt;
    }

    select {
        margin: 0;
    }

    input {
        margin: 0;
    }

    .TT_trigger {
    }

    .TT_text {
        visibility: hidden;
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
</style>

<div class="options" style={"color: " + colorLookup.textDark}>
    <div style="display: flex; flex-direction: row; align-items: center; justify-content: space-between">
        <h1 style={"color: " + colorLookup.text}>Generator</h1>
        <Button on:click={showAdvancedModal} style="font-size: 10pt">Advanced</Button>
    </div>

    <div class="optionElement">
        <label for="genre" class="TT_trigger">
            Genre:
            <span class="TT_text" style={tt_text_style}>
                The style of music to generate
            </span>
        </label>
        <span id="genre" style={"color: " + colorLookup.text}>{$genreStore[0]}</span>
        <Button on:click={showGenreModal} style="font-size: 24px; padding: 0 4px 0 4px; margin: 0 0 0 8px;">⚙</Button>
    </div>


    <div class="optionElement">
        <label for="generationlength" class="TT_trigger">
            Length:
            <span class="TT_text" style={tt_text_style}>
                How many tokens to generate.
                One note is usually two tokens
            </span>
        </label>
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

    <div style="align-self: flex-start">
        <label class="TT_trigger">
            Instruments:
            <span class="TT_text" style={tt_text_style}>
                Selecting an instrument gives a strong suggestion to the AI.
                It might just ignore you, but will try and respect the settings where possible.
                Results are better if you select instruments that make sense for the selected genre.
            </span>
        </label>
    </div>
    <div style="display: flex; flex-direction: row; flex-wrap: wrap">
        {#each instrumentCategories as instrument}
            <InstrumentCheckbox storeMap={instrumentStores} {instrument}/>
        {/each}
    </div>
</div>
