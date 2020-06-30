<script lang="ts">
  import {
    preplayStore,
    autoScrollStore,
    autoPlayStore,
  } from "../state/settings";
  import { play, stop, audioStatusStore } from "../audio/audioPlayer";
  import Button from "../buttons/Button.svelte";
  import colorLookup from "../colors";
  import AboutModalButton from "../about/AboutModalButton.svelte";
  import FileInput from "../buttons/FileInput.svelte";
  import { root } from "../state/trackTree";
  import { save, load } from "../persistence/persistence";
  import { undoStore } from "../state/undo";
  import Tooltip from "../tooltips/Tooltip.svelte";
  import toCss from "react-style-object-to-css";

  const reader: FileReader = new FileReader();
  reader.onload = () => {
    const result = reader.result;
    if (result !== null) load(root, result as string);
  };

  function loadClicked(file: File) {
    reader.readAsText(file);
  }

  let disallowSave: boolean;
  $: disallowSave = Object.keys($root.children).length === 0;
</script>

<style>
  .container {
    height: 100%;
    display: flex;
    flex-direction: row;
  }

  .col {
    display: flex;
    flex-direction: column;
  }

  .center {
    justify-content: center;
    text-align: center;
    align-items: center;
  }

  .margin {
    margin: 0 8px;
  }

  .slider {
    width: 100px;
  }

  .playStop {
    width: 25px;
    font-size: 24pt;
    cursor: pointer;
    margin-right: 12px;
    margin-top: -5px;
  }
</style>

<div
  class="container center"
  style={toCss({ color: colorLookup.textDark, borderTop: '1px solid', borderColor: colorLookup.border, backgroundColor: colorLookup.bgDark })}>
  {#if $audioStatusStore.type === 'on'}
    <div class="playStop" on:click={stop} style={toCss({color: colorLookup.text})}>
      ■
    </div>
  {:else if $audioStatusStore.type === 'loading'}
    <div class="playStop" style={toCss({color: colorLookup.text, cursor: "default"})}>
      ▶
    </div>
  {:else}
    <div
      class="playStop"
      on:click={() => play(0)}
      style={toCss({color: colorLookup.text})}>
      ▶
    </div>
  {/if}

  <div class="col center margin">
    <Tooltip>
      <label for="autoScroll" slot="trigger">Auto Scroll</label>
      <span>
        Scroll the track to show the part that is playing
      </span>
    </Tooltip>
    <input id="autoScroll" type="checkbox" bind:checked={$autoScrollStore} />
  </div>

  <div class="col center margin">
    <Tooltip>
      <label for="autoPlay" slot="trigger">Auto Play</label>
      <span>
        Start playing the audio when a new node is selected
      </span>
    </Tooltip>
    <input id="autoPlay" type="checkbox" bind:checked={$autoPlayStore} />
  </div>

  <div class="col margin">
    <Tooltip>
      <label for="preplay" slot="trigger">Pre-Play: {$preplayStore}s</label>
      <span>
        When a section auto-plays, how many seconds of the previous section
        should we play first?
      </span>
    </Tooltip>
    <input
      class="slider"
      id="preplay"
      bind:value={$preplayStore}
      type="range"
      min="0"
      max="5"
      step="0.5" />
  </div>

  <Button disabled={$undoStore.length === 0} on:click={undoStore.undo}>
    Undo (ctrl + z)
  </Button>

  <FileInput fileTypes=".mst" handleFile={loadClicked}>Load</FileInput>
  <Button disabled={disallowSave} on:click={() => save(root)}>Save</Button>

  <AboutModalButton />
</div>
