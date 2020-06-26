<script lang="ts">
  import colorLookup from "../colors";
  import { loadingProgressStore } from "./persistence";
  import type { LoadingProgressState } from "./persistence"
  import toCss from "react-style-object-to-css"

  let loadingState: LoadingProgressState;
  $: loadingState = $loadingProgressStore;

  let done: number;
  $: done = loadingState === null ? 0 : loadingState.done;

  let total: number;
  $: total = loadingState === null ? 0 : loadingState.total;

  let percent: number;
  $: percent = (100 * (done || 0)) / (total || 1);
</script>

<style>
  .backdrop {
    position: relative;
    width: 200px;
    height: 40px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .bar {
    border-radius: 4px;
    height: 100%;
    transition: width 0.2s ease-in-out;
  }

  .textContainer {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  span {
    text-align: center;
  }
</style>

<div class="backdrop" style={toCss({backgroundColor: colorLookup.loadingBarBG})}>
  {#if loadingState}
    <div class="textContainer" style={toCss({color: colorLookup.loadingBarText})}>
      <span>{done.toLocaleString()} / {total.toLocaleString()}</span>
      <span>({percent.toFixed(0)}%)</span>
    </div>
  {/if}
  <div
    class="bar"
    style={toCss({backgroundColor: colorLookup.loadingBarFG, width: percent + "%"})} />
</div>
