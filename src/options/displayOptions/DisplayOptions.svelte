<script>
    import {
        yScaleStore,
        splitStore
    } from "../../state/settings";
    import {getContext} from "svelte";
    import Button from "../../buttons/Button.svelte";
    import colorLookup, {modalOptions} from "../../colors";
    import DisplayOptionsModal from "./DisplayOptionsModal.svelte";

    const {open} = getContext("simple-modal");

    function showGenreModal() {
        open(DisplayOptionsModal, {}, modalOptions);
    }

    function showAdvancedModal() {
        open(DisplayOptionsModal, {}, modalOptions);
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
        <h1 style={`color: ${colorLookup.text}`}>Display</h1>
        <Button on:click={showAdvancedModal} style="font-size: 10pt">Advanced</Button>
    </div>

    <div class="optionElement">
        <label for="yScale">Track Zoom</label>
        <input class="slider" id="yScale" bind:value={$yScaleStore} type="range" min="10" max="500" step="10"/>
        <span>{$yScaleStore}%</span>
    </div>

    <div class="optionElement">
        <label for="split">View Split</label>
        <input class="slider" id="split" bind:value={$splitStore} type="range" min="0" max="100" step="5"/>
        <span>{$splitStore}%</span>
    </div>
</div>
