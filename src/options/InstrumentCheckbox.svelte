<script>
  import colorLookup from "../colors";
  export let instrument;
  export let storeMap;

  $: store = storeMap[instrument];
  $: id = "instrument-" + instrument;

  function toggle() {
    store.update(state => !state);
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

<div class="row" style={`border: 1px solid ${colorLookup.border}`} on:click={toggle}>
  <input {id} type="checkbox" bind:checked={$store} />
  <label for={id} style={"color: " + colorLookup[instrument]}>{instrument}</label>
</div>
