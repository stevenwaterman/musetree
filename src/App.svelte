<script>
  import Track from "./track/Track.svelte";
  import GenerationOptions from "./generationOptions/GenerationOptions.svelte";
  import PersistenceOptions from "./persistence/PersistenceOptions.svelte";
  import TrackControls from "./track/TrackControls.svelte";
  import TreeVis from "./treeVis/TreeVis.svelte";
  import Links from "./links/Links.svelte";
  import ModalWrapper from "./modals/ModalWrapper.svelte";
</script>

<style>
  .columns {
    display: grid;
    grid-template-columns: 1fr 1fr 300px;
    grid-template-rows: auto;
    width: 100vw;
    height: 100vh;
  }

  .col {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  :global(body) {
    padding: 0;
    margin: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
</style>

<div class="columns">
  <ModalWrapper/>
  <div class="col">
    <Track />
    <TrackControls />
  </div>
  <div class="col">
    <TreeVis />
  </div>
  <div class="col">
    <GenerationOptions />
    <PersistenceOptions />
    <Links />
  </div>
</div>
