<script lang="ts">
  import {
    maxResponseLengthStore,
    temperatureStore,
    autoRequestStore,
  } from "../../state/settings";
  import colorLookup from "../../colors";
  import Tooltip from "../../tooltips/Tooltip.svelte"
  import toCss from "react-style-object-to-css";
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

  input {
    margin: 0;
  }

  label {
    font-weight: 600;
    margin: 0 8px 0 0;
  }
</style>

<div style="height: 200px">
  <h1 style={toCss({color: colorLookup.text})}>Advanced Generation Options</h1>

  <div class="optionElement">
    <Tooltip>
      <label for="responselength" slot="trigger">Max Length</label>
      <span>
        If the response would have more tokens than this, we reduce the number
        of tokens that we send to MuseNet. Higher values produce songs with more
        long-term structure but increase the failure rates of MuseNet. Values
        below 3000 are known to work.
      </span>
    </Tooltip>

    <input
      class="slider"
      id="responselength"
      bind:value={$maxResponseLengthStore}
      type="range"
      min="500"
      max="5000"
      step="100" />
    <span>{$maxResponseLengthStore}</span>
  </div>

  <div class="optionElement">
    <Tooltip>
      <label for="temperature" slot="trigger">Temperature:</label>
      <span>
        How adventurous the AI is allowed to be. Try increasing temperature if
        you are stuck in a repeating pattern or if MuseNet starts generating a
        real song.
      </span>
    </Tooltip>

    <input
      class="slider"
      id="temperature"
      bind:value={$temperatureStore}
      type="range"
      min="0.8"
      max="1.2"
      step="0.01" />
    <span>{$temperatureStore}</span>
  </div>

  <div class="optionElement">
    <Tooltip>
      <label for="autoRequest" slot="trigger">Auto Request</label>
      <span>
        Immediately request more as soon as you select a node for the first time
      </span>
    </Tooltip>
    <input id="autoRequest" type="checkbox" bind:checked={$autoRequestStore} />
  </div>
</div>
