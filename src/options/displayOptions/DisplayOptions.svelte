<script lang="ts">
  import { yScaleStore, splitStore } from "../../state/settings";
  import { getContext } from "svelte";
  import Button from "../../buttons/Button.svelte";
  import colorLookup, { modalOptions } from "../../colors";
  import DisplayOptionsModal from "./DisplayOptionsModal.svelte";
  import Tooltip from "../../tooltips/Tooltip.svelte"
  import toCss from "react-style-object-to-css";

  const { open } = getContext("simple-modal");

  function showAdvancedModal() {
    open(DisplayOptionsModal, {}, modalOptions);
  }
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

  input {
    margin: 0;
  }

  .row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
</style>

<div class="options" style={toCss({color: colorLookup.textDark})}>
  <div class="row">
    <h1 style={toCss({ color: colorLookup.text })}>Display</h1>
    <Button on:click={showAdvancedModal} style={toCss({ fontSize: 10 })}>
      Advanced
    </Button>
  </div>

  <div class="optionElement">
    <Tooltip>
      <label for="yScale" slot="trigger">Track Zoom</label>
      <span>Vertically zoom the track view</span>
    </Tooltip>
    <input
      class="slider"
      id="yScale"
      bind:value={$yScaleStore}
      type="range"
      min="10"
      max="500"
      step="10" />
    <span>{$yScaleStore}%</span>
  </div>

  <div class="optionElement">
    <Tooltip>
      <label for="split" slot="trigger">View Split</label>
      <span>
        How much horizontal space to take up with the track view
      </span>
    </Tooltip>
    <input
      class="slider"
      id="split"
      bind:value={$splitStore}
      type="range"
      min="0"
      max="100"
      step="5" />
    <span>{$splitStore}%</span>
  </div>
</div>
