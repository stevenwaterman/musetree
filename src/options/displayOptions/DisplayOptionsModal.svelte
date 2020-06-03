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
    import colorLookup, {instrumentVisibility} from "../../colors";
    import {instruments} from "../../constants";
    import Button from "../../buttons/Button.svelte";

    const tt_text_style = "border: 1px solid " + colorLookup.border + "; background-color: " + colorLookup.bgLight;

    function selectAll() {
        instruments.forEach(instrument => {
            instrumentVisibility[instrument].set(true);
        })
    }
    function selectNone() {
        instruments.forEach(instrument => {
            instrumentVisibility[instrument].set(false);
        })
    }
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

    span {
        margin: 4px;
    }
</style>

<h1 style={"color: " + colorLookup.text}>Advanced Display Options</h1>

<div style="display: flex; flex-direction: column">
    <div style="align-self: flex-start">
        <label class="TT_trigger">
            Show Instruments:
            <span class="TT_text" style={tt_text_style}>
            Deselecting an instrument will hide it from the track view.
            The instrument will still play, but you won't see it.
        </span>
        </label>
    </div>
    <div style="display: flex; flex-direction: row; flex-wrap: wrap">
        {#each instruments as instrument}
            <InstrumentCheckbox storeMap={instrumentVisibility} {instrument}/>
        {/each}
    </div>
    <div style="display: flex; flex-direction: row;">
        <Button on:click={selectAll}>Show All</Button>
        <Button on:click={selectNone}>Hide All</Button>
    </div>
</div>
