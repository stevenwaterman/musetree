<script>
  import { downloadAudio } from "../broker.js";
  import {selectedTrackStore, selectedTrackAudioStore, selectedTrackEncodingStore} from "../track/trackTree.js";

  function save() {}

  function load() {}

  function exportAudio(format) {
      downloadAudio($selectedTrackEncodingStore, format, "export");
  }
</script>

<style>
  .container {
    display: flex;
    flex-direction: row;
  }
  .dropdown-content {
    display: none;
    flex-direction: column;
    position: absolute;
  }
  .dropdown:hover .dropdown-content {
    display: flex;
  }
  button {
    margin: 4px;
  }
</style>

<div class="container">
  <button on:click={save}>Save</button>
  <button on:click={load}>Load</button>
  <div class="dropdown">
    <button class="dropbtn">Export</button>
    <div class="dropdown-content">
      <button on:click={() => exportAudio('mp3')}>.mp3</button>
      <button on:click={() => exportAudio('wav')}>.wav</button>
      <button on:click={() => exportAudio('ogg')}>.ogg</button>
      <button on:click={() => exportAudio('midi')}>.midi</button>
    </div>
  </div>
</div>
