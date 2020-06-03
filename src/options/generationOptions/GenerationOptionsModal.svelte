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

    const tt_text_style = "border: 1px solid " + colorLookup.border + "; background-color: " + colorLookup.bgLight;
</script>

<style>
    h1 {
        margin-top: 0;
    }

    .optionElement {
        display: flex;
        flex-direction: row;
        align-items: center;
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

    input {
        margin: 0;
    }

    label {
        font-weight: 600;
        margin: 0 8px 0 0;
    }
</style>

<h1 style={"color: " + colorLookup.text}>Advanced Generation Options</h1>

<div class="optionElement">
    <label for="responselength" class="TT_trigger">
        Max Length:
        <span class="TT_text" style={tt_text_style}>
                If the response would have more tokens than this,
                we reduce the number of tokens that we send to MuseNet.
                Higher values produce songs with more long-term structure
                but increase the failure rates of MuseNet.
                Values below 3000 are known to work.
            </span>
    </label>
    <input
            class="slider"
            id="responselength"
            bind:value={$maxResponseLengthStore}
            type="range"
            min="500"
            max="5000"
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

<div class="optionElement">
    <label for="autoRequest" class="TT_trigger">
        Auto Request
        <span class="TT_text" style={tt_text_style}>
                Immediately request more as soon as you select a node for the first time
            </span>
    </label>
    <input id="autoRequest" type="checkbox" bind:checked={$autoRequestStore}/>
</div>