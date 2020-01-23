<script>
  import Track from "./track/Track.svelte";
  import Options from "./Options.svelte";
  import { audio } from "./track/audio.js";
  import TrackControls from "./track/TrackControls.svelte";
</script>

<style>
  .columns {
    display: flex;
    flex-direction: row;
  }

  .col {
    display: flex;
    flex-direction: column;
  }
</style>

<main>
  <div class="columns">
    <div class="col">
      <Track />
      <TrackControls />
    </div>
    <Options />
  </div>
</main>
