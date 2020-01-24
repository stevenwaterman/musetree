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
  } from "../settings.js";
  import InstrumentCheckbox from "./InstrumentCheckbox.svelte";
  import { genres, instruments } from "../constants.js";
  import {audio} from "../track/audio.js";
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
    <select id="genre" bind:value={$genreStore}>
      {#each genres as genre}
        <option value={genre}>{genre}</option>
      {/each}
    </select>
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
      step="10" />
      <span>{$generationLengthStore}</span>
  </div>

  <label>Instruments:</label>
  {#each instruments as instrument}
    <InstrumentCheckbox {instrument} />
  {/each}

  <div class="optionElement">
    <label for="autoRequest">Auto Request</label>
    <input id="autoRequest" type="checkbox" bind:checked={$autoRequestStore} />
  </div>
</div>
