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
    } from "../state/settings";
    import InstrumentCheckbox from "./InstrumentCheckbox.svelte";
    import {genres, instrumentCategories} from "../constants";
    import {getContext} from "svelte";
    import GenresModal from "./GenresModal.svelte";
    import Button from "../buttons/Button.svelte";
    import colorLookup, {modalOptions} from "../colors";

    const {open} = getContext("simple-modal");

    function showGenreModal() {
        open(GenresModal, {}, modalOptions)
    }

    //TODO have a styled tooltip component that's reusable
    const tt_text_style = "border: 1px solid " + colorLookup.border + "; background-color: " + colorLookup.bgLight;
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

    h1 {
        margin: 0;
        text-align: center;
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
    <h1 style={"color: " + colorLookup.text}>Generator</h1>

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
            Generation Length:
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

    <div class="optionElement">
        <label for="responselength" class="TT_trigger">
            Max Length:
            <span class="TT_text" style={tt_text_style}>
                If the response would have more tokens than this,
                we reduce the number of tokens that we send to MuseNet.
                Higher values produce songs with more long-term structure
                but increase the failure rates of MuseNet.
            </span>
        </label>
        <input
                class="slider"
                id="responselength"
                bind:value={$maxResponseLengthStore}
                type="range"
                min="500"
                max="3000"
                step="100"/>
        <span>{$maxResponseLengthStore}</span>
    </div>

    <div class="optionElement">
        <label for="temperature" class="TT_trigger">
            Temperature:
            <span class="TT_text" style={tt_text_style}>
                How adventurous the AI is allowed to be.
                Try increasing temperature if you are stuck in a repeating pattern or if MuseNet starts generating a real song.
            </span>
        </label>
        <input
                class="slider"
                id="temperature"
                bind:value={$temperatureStore}
                type="range"
                min="0.8"
                max="1.2"
                step="0.01"/>
        <span>{$temperatureStore}</span>
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
    {#each instrumentCategories as instrument}
        <InstrumentCheckbox {instrument}/>
    {/each}

    <div class="optionElement">
        <label for="autoRequest" class="TT_trigger">
            Auto Request
            <span class="TT_text" style={tt_text_style}>
                Immediately request more as soon as you select a node for the first time
            </span>
        </label>
        <input id="autoRequest" type="checkbox" bind:checked={$autoRequestStore}/>
    </div>
</div>
