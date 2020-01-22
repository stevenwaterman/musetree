<script>
  import { instrumentStores } from "./settings.js";
  export let instrument;
  $: enabledStore = instrumentStores[instrument];
</script>

<style>

</style>

<input type="checkbox" bind:checked={$enabledStore} />
{instrument}
