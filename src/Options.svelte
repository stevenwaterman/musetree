<script>
  import {
    genreStore,
    generationLengthStore,
    instrumentStores,
    truncationStore,
    temperatureStore,
    autoRequestStore,
    autoScrollStore,
    preplayStore,
    yScaleStore
  } from "./settings.js";
  import InstrumentCheckbox from "./InstrumentCheckbox.svelte";
  import { genres, instruments } from "./constants.js";
  import {audio} from "./track/audio.js";
</script>

<style>
  .options {
      padding: 12px;
    display: flex;
    flex-direction: column;
    width: 100%;
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
  <h1 class="header">Options:</h1>
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

  <!-- <div class="optionElement">
    <label for="temperature">Temperature:</label>
    <input id="temperature" bind:value={$temperatureStore} type="range" min="1" max="100" />
    <span>{$temperatureStore}</span>
  </div>

  <div class="optionElement">
    <label for="truncation">Truncation:</label>
    <input id="truncation" bind:value={$truncationStore} type="range" min="1" max="100" />
    <span>{$truncationStore}</span>
  </div> -->

  <div class="optionElement">
    <label for="autoRequest">Auto Request</label>
    <input id="autoRequest" type="checkbox" bind:checked={$autoRequestStore} />
  </div>

  <div class="optionElement">
    <label for="yScale">Y Scale:</label>
    <input id="yScale" bind:value={$yScaleStore} type="range" min="10" max="250" step="5" />
    <span>{$yScaleStore}</span>
  </div>

  <div class="optionElement">
    <label for="preplay">Pre-Play (s):</label>
    <input id="preplay" bind:value={$preplayStore} type="range" min="0" max="5" step="0.5" />
    <span>{$preplayStore}</span>
  </div>

   <div class="optionElement">
    <label for="autoScroll">Auto Scroll</label>
    <input id="autoScroll" type="checkbox" bind:checked={$autoScrollStore} />
  </div>

  <button on:click={() => audio.play(0)}>Play from Start</button>
</div>
