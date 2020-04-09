<script>
  import { downloadAudio } from "../broker";
  import download from "downloadjs";

  function save() {
    // download(JSON.stringify($trackTreeStore), "save.json");
  }

  const reader = new FileReader();
  reader.onload = event => {
    // trackTreeStore.set(JSON.parse(event.target.result));
  };

  function load(event) {
    // reader.readAsText(event.target.files[0]);
  }

  function exportAudio(format) {
    // downloadAudio($selectedTrackEncodingStore, format, "export");
  }

  // $: trackLoaded = $selectedTrackEncodingStore === "";
</script>

<style>
  .container {
    padding: 12px;
  }
  .row {
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
  <h1>Persistence</h1>
  <div class="row">
<!--    <button-->
<!--      disabled={Object.keys($trackTreeStore.children).length === 0}-->
<!--      on:click={save}>-->
<!--      Save-->
<!--    </button>-->
    <label for="upload">
      <span>Load</span>
      <input
        id="upload"
        type="file"
        accept=".json"
        multiple={false}
        on:change={load}
        style="display:none" />
    </label>
<!--    <div class="dropdown">-->
<!--      <button disabled={trackLoaded} class="dropbtn">Export</button>-->
<!--      <div class="dropdown-content">-->
<!--        <button disabled={trackLoaded} on:click={() => exportAudio('mp3')}>-->
<!--          .mp3-->
<!--        </button>-->
<!--        <button disabled={trackLoaded} on:click={() => exportAudio('wav')}>-->
<!--          .wav-->
<!--        </button>-->
<!--        <button disabled={trackLoaded} on:click={() => exportAudio('ogg')}>-->
<!--          .ogg-->
<!--        </button>-->
<!--        <button disabled={trackLoaded} on:click={() => exportAudio('midi')}>-->
<!--          .midi-->
<!--        </button>-->
<!--      </div>-->
<!--    </div>-->
  </div>
</div>
