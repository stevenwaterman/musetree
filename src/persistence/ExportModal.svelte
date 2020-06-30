<script lang="ts">
  import {
    selectedEncodingStore,
    selectedBranchStore,
  } from "../state/trackTree";
  import {
    downloadMuseTreeAudio,
    downloadMuseNetAudio,
    downloadMidiAudio,
downloadHighQualityMuseTreeAudio,
  } from "./export";
  import colorLookup from "../colors";
  import download from "downloadjs";
  import Button from "../buttons/Button.svelte";
  import { encodingToString } from "../state/encoding";
  import type { MusenetEncoding } from "../state/encoding";
  import type { Section } from "../state/section";
  import { root } from "../state/trackTree";
  import type { BranchStore, BranchState } from "../state/trackTree";
  import Tooltip from "../tooltips/Tooltip.svelte";
  import type { Readable } from "svelte/store";
  import toCss from "react-style-object-to-css"

  export let store: BranchStore;

  let state: BranchState;
  $: state = $store;

  let trackEncoding: MusenetEncoding;
  $: trackEncoding = state.encoding;

  let sectionEncoding: MusenetEncoding;
  $: sectionEncoding = state.section.encoding;

  let selectedSectionsStore: Readable<Section[]>;
  $: selectedSectionsStore = root.selectedSectionsStore;

  let trackEncodingString: string;
  $: trackEncodingString = encodingToString(trackEncoding);

  let sectionEncodingString: string;
  $: sectionEncodingString = encodingToString(sectionEncoding);

  let fullTrack: boolean = true;

  let encoding: string;
  $: encoding = fullTrack ? trackEncodingString : sectionEncodingString;

  let name: string = "MuseTreeExport";
  let encodingArea: HTMLTextAreaElement | undefined;

  function copy() {
    if (encodingArea) {
      encodingArea.select();
      document.execCommand("copy");
      encodingArea.setSelectionRange(0, 0);
    }
  }

  const lighterStyle: JSX.CSSProperties = {
    borderColor: colorLookup.border,
    backgroundColor: colorLookup.bgLight,
    color: colorLookup.text,
  };
</script>

<style>
  h1 {
    margin-top: 0;
  }

  h2 {
    margin-top: 4px;
    margin-bottom: 4px;
  }

  .encoding {
    width: 100%;
    height: 100px;
    scrollbar-color: #c3cee3 #1f292e;
    resize: none;
    margin: 0;
  }

  .copy_trigger {
    position: relative;
  }

  .copy {
    display: none;
    position: absolute;
    inset: 8px 8px 12px 8px;
    border-radius: 24px;
    align-items: center;
    justify-content: center;
  }

  .copy_trigger:hover .copy {
    display: flex;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    grid-gap: 12px;
  }

  .leftMargin {
    margin-left: 12px;
  }

  .dottedBorder {
    border: 1px dotted;
  }

  .row {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 12px;
  }
</style>

<h1 style={toCss({ color: colorLookup.text })}>Export</h1>

<div class="row">
  <label for="exportName">File name:</label>
  <input
    id="exportName"
    bind:value={name}
    type="text"
    class={['leftMargin', 'dottedBorder'].join(" ")}
    style={toCss({ marginBottom: 0, ...lighterStyle })} />

  <Tooltip>
    <label slot="trigger" class="leftMargin">Encoding:</label>
    <span>
      Export the whole track up until that point, or just the one section you
      clicked?
    </span>
  </Tooltip>
  <Button
    on:click={() => {
      fullTrack = true;
    }}
    emphasise={fullTrack}>
    Track
  </Button>
  <Button
    on:click={() => {
      fullTrack = false;
    }}
    emphasise={!fullTrack}>
    Section
  </Button>
</div>

<label for="encoding" style="display: none">Encoding</label>
<div class="copy_trigger">
  <textarea
    bind:this={encodingArea}
    id="encoding"
    class={['dottedBorder'].join(" ")}
    readonly
    style={toCss({...lighterStyle, width: "100%", resize: "none"})}>{encoding}</textarea>
  <div
    class="copy"
    style={toCss({color: colorLookup.text , backgroundColor: colorLookup.bgDark + '99'})}
    on:click={copy}>
    Click to copy
  </div>
</div>

<h2 style={toCss({ color: colorLookup.text })}>Export as:</h2>

<div class="grid">
  <span>
    <b style={toCss({ color: colorLookup.text })}>Recommended:</b>
    Audio as it sounds elsewhere in the app, re-rendered as one section to prevent issues on section boundaries
  </span>
  <Button on:click={() => downloadHighQualityMuseTreeAudio($selectedSectionsStore, name)}>
    MuseTree (High Quality .wav)
  </Button>

  <span>
    Audio as it sounds elsewhere in the app
  </span>
  <Button on:click={() => downloadMuseTreeAudio($selectedSectionsStore, name)}>
    MuseTree (Fast Render .wav)
  </Button>

  <span>
    Request the audio from MuseNet - as it would sound in the official MuseNet
    tool. Less synth-y than the MuseTree export, but it can take a minute to
    respond
  </span>
  <div style="display: flex; flex-direction: column">
    <Button
      on:click={() => {
        const encoding = $selectedEncodingStore;
        if (encoding !== null) {
          downloadMuseNetAudio(encoding, 'wav', name);
        }
      }}>
      MuseNet (.wav)
    </Button>
    <Button
      on:click={() => {
        const encoding = $selectedEncodingStore;
        if (encoding !== null) {
          downloadMuseNetAudio(encoding, 'mp3', name);
        }
      }}>
      MuseNet (.mp3)
    </Button>
    <Button
      on:click={() => {
        const encoding = $selectedEncodingStore;
        if (encoding !== null) {
          downloadMuseNetAudio(encoding, 'ogg', name);
        }
      }}>
      MuseNet (.ogg)
    </Button>
  </div>

  <span>Midi file for editing in other software:</span>
  <Button
    on:click={() => {
      const encoding = $selectedEncodingStore;
      if (encoding !== null) {
        downloadMidiAudio(encoding, name);
      }
    }}>
    Midi
  </Button>

  <span>Text file containing the encoding as seen in the box above:</span>
  <Button
    on:click={() => {
      const encoding = $selectedEncodingStore;
      if (encoding !== null) {
        download(encodingToString(encoding), name + '.txt');
      }
    }}>
    Encoding
  </Button>

  <span>
    Log info about the current track to the browser console for debugging
  </span>
  <Button
    on:click={() => {
      const branch = $selectedBranchStore;
      if (branch !== null) {
        console.log(JSON.stringify(branch.section));
      }
    }}>
    Log
  </Button>
</div>
