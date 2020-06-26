<script lang="ts">
  import colorLookup from "../colors";
  import type {Writable} from "svelte/store"
  import toCss from "react-style-object-to-css";

  export let instrument: keyof typeof colorLookup;
  export let storeMap: Partial<Record<keyof typeof colorLookup, Writable<boolean>>>;

  let store: Writable<boolean> | undefined;
  $: store = storeMap[instrument];
  
  let id: string;
  $: id = "instrument-" + instrument;

  function toggle() {
    if(store) store.update((state: boolean) => !state);
  }
</script>

<style>
  .row{
    display:flex;
    flex-direction: row;
    align-items: center;
    margin: 4px;
    padding: 0 8px 0 8px;
    cursor: pointer;
  }

  label {
    margin: 0;
    pointer-events: none;
  }

  input {
    margin: 0 8px 0 0;
    cursor: pointer;
  }
</style>

{#if store}
<div class="row" style={toCss({border: "1px solid", borderColor: colorLookup.border})} on:click={toggle}>
  <input {id} type="checkbox" bind:checked={$store} />
  <label for={id} style={toCss({color: colorLookup[instrument]})}>{instrument}</label>
</div>
{/if}
