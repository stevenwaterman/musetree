<script lang="ts">
  import {
    genreStore,
    generationLengthStore,
    instrumentStores,
  } from "../../state/settings";
  import InstrumentCheckbox from "../InstrumentCheckbox.svelte";
  import { instrumentCategories } from "../../constants";
  import { getContext } from "svelte";
  import GenresModal from "./GenresModal.svelte";
  import Button from "../../buttons/Button.svelte";
  import colorLookup, { modalOptions } from "../../colors";
  import GenerationOptionsModal from "./GenerationOptionsModal.svelte";
  import Tooltip from "../../tooltips/Tooltip.svelte";
  import toCss from "react-style-object-to-css"

  const { open } = getContext("simple-modal");

  function showGenreModal() {
    open(GenresModal, {}, modalOptions);
  }

  function showAdvancedModal() {
    open(GenerationOptionsModal, {}, modalOptions);
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
    display: flex; flex-direction: row; align-items: center; justify-content: space-between
  }
</style>

<div class="options" style={toCss({color: colorLookup.textDark})}>
  <div
    class="row">
    <h1 style={toCss({color: colorLookup.text})}>Generator</h1>
    <Button on:click={showAdvancedModal} style="font-size: 10pt">
      Advanced
    </Button>
  </div>

  <div class="optionElement">
    <Tooltip>
      <label for="genre" slot="trigger">Genre:</label>
      <span>The style of music to generate</span>
    </Tooltip>
    <span id="genre" style={toCss({color: colorLookup.text})}>
      {$genreStore[0]}
    </span>
    <Button
      on:click={showGenreModal}
      style={{fontSize: 24, padding: 0, paddingRight: 4, paddingLeft: 4, margin: 0, marginLeft: 8}}>
      ⚙
    </Button>
  </div>

  <div class="optionElement">
    <Tooltip>
      <label for="generationlength" slot="trigger">Length:</label>
      <span>
        How many tokens to generate. One note is usually two tokens
      </span>
    </Tooltip>

    <input
      class="slider"
      id="generationLength"
      bind:value={$generationLengthStore}
      type="range"
      min="20"
      max="1000"
      step="10" />
    <span>{$generationLengthStore}</span>
  </div>

  <div style="align-self: flex-start">
    <Tooltip>
      <label slot="trigger">Instruments:</label>
      <span>
        Selecting an instrument gives a strong suggestion to the AI. It might
        just ignore you, but will try and respect the settings where possible.
        Results are better if you select instruments that make sense for the
        selected genre.
      </span>
    </Tooltip>
  </div>
  <div style="display: flex; flex-direction: row; flex-wrap: wrap">
    {#each instrumentCategories as instrument}
      <InstrumentCheckbox storeMap={instrumentStores} {instrument} />
    {/each}
  </div>
</div>
