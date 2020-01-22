<script>
  import {
    genreStore,
    generationLengthStore,
    instrumentStores,
    truncationStore,
    temperatureStore,
    autoRequestStore
  } from "./settings.js";
  import {
      yScaleStore
  } from "./constants.js";
  import InstrumentCheckbox from "./InstrumentCheckbox.svelte";
  import { genres, instruments } from "./constants.js";
</script>

<style>

</style>

Genre:
<select bind:value={$genreStore}>
  {#each genres as genre}
    <option value={genre}>{genre}</option>
  {/each}
</select>

Generation Length: {$generationLengthStore}
<input bind:value={$generationLengthStore} type="range" min="20" max="1000" step="10" />

Instruments:
{#each instruments as instrument}
    <InstrumentCheckbox {instrument}/>
{/each}

Temperature: {$temperatureStore}
<input bind:value={$temperatureStore} type="range" min="1" max="100" />

Truncation: {$truncationStore}
<input bind:value={$truncationStore} type="range" min="1" max="100" />

<input type="checkbox" bind:checked={$autoRequestStore} />
Auto Request

Y Scale: {$yScaleStore}
<input bind:value={$yScaleStore} type="range" min="10" max="250" step="5"/>