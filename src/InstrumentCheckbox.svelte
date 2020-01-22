<script>
  import { instrumentStores } from "./settings.js";
  export let instrument;
  $: enabledStore = instrumentStores[instrument];
  $: id = "instrument-" + instrument;
</script>

<style>
  .row{
    display:flex;
    flex-direction: row;
    align-items: center;
  }

  label {
    margin: 0;
  }

  input {
    margin: 0 8px;
  }
</style>

<div class="row">
  <input {id} type="checkbox" bind:checked={$enabledStore} />
  <label for={id}>{instrument}</label>
</div>
