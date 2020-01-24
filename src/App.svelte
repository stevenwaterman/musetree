<script>
  import Track from "./track/Track.svelte";
  import GenerationOptions from "./generationOptions/GenerationOptions.svelte";
  import PersistenceOptions from "./persistence/PersistenceOptions.svelte";
  import { audio } from "./track/audio.js";
  import TrackControls from "./track/TrackControls.svelte";
  import TreeVis from "./treeVis/TreeVis.svelte";
</script>

<style>
  .columns {
    display: grid;
    grid-template-columns: 1fr 1fr 200px;
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
  <div class="col">
  <!-- 1 -->
    <Track />
    <TrackControls />
  </div>
  <div class="col">
  <!-- 2 -->
    <TreeVis />
  </div>
  <div class="col">
  <!-- 3 -->
    <GenerationOptions />
    <PersistenceOptions />
  </div>
</div>
