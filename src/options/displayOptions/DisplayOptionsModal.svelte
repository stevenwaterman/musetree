<script lang="ts">
  import InstrumentCheckbox from "../InstrumentCheckbox.svelte";
  import colorLookup, { instrumentVisibility } from "../../colors";
  import { instruments } from "../../constants";
  import Button from "../../buttons/Button.svelte";
  import Tooltip from "../../tooltips/Tooltip.svelte";

  function selectAll() {
    instruments.forEach((instrument) => {
      instrumentVisibility[instrument].set(true);
    });
  }

  function selectNone() {
    instruments.forEach((instrument) => {
      instrumentVisibility[instrument].set(false);
    });
  }
</script>

<style>
  h1 {
    margin-top: 0;
  }

  label {
    font-weight: 600;
    margin: 0 8px 0 0;
  }

  span {
    margin: 4px;
  }
</style>

<h1 style={'color: ' + colorLookup.text}>Advanced Display Options</h1>

<div style="display: flex; flex-direction: column">
  <div style="align-self: flex-start">
    <Tooltip>
      <label slot="trigger">Show Instruments:</label>
      <span slot="content">
        Deselecting an instrument will hide it from the track view. The
        instrument will still play, but you won't see it.
      </span>
    </Tooltip>
  </div>
  <div style="display: flex; flex-direction: row; flex-wrap: wrap">
    {#each instruments as instrument}
      <InstrumentCheckbox storeMap={instrumentVisibility} {instrument} />
    {/each}
  </div>
  <div style="display: flex; flex-direction: row;">
    <Button on:click={selectAll}>Show All</Button>
    <Button on:click={selectNone}>Hide All</Button>
  </div>
</div>
