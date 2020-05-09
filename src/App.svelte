<script>
  import Track from "./track/Track.svelte";
  import GenerationOptions from "./generationOptions/GenerationOptions.svelte";
  import PersistenceOptions from "./persistence/PersistenceOptions.svelte";
  import { audio } from "./track/audio.js";
  import TrackControls from "./track/TrackControls.svelte";
  import TreeVis from "./treeVis/TreeVis.svelte";
  import Links from "./links/Links.svelte";

  alert("Important Notice\n" +
          "On 2020-05-16, MuseTree will undergo a major update to version 2.\n" +
          "While version 2 is essentially identical on the surface, its internals have been almost entirely rewritten.\n" +
          "This means that any save files created in v1 will not be supported in v2.\n" +
          "v1 will still be available for those that need it but will not be supported or updated in the future")
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
