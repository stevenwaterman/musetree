<script lang="ts">
  import Track from "./track/Track.svelte";
  import GenerationOptions from "./options/generationOptions/GenerationOptions.svelte";
  import TrackControls from "./track/TrackControls.svelte";
  import TreeVis from "./treeVis/TreeVis.svelte";
  import Modal from "svelte-simple-modal";
  import ModalController from "./modals/ModalController.svelte";
  import colorLookup from "./colors";
  import { splitStore, showSidebarStore } from "./state/settings";
  import { togglePlayback } from "./audio/audioPlayer";
  import { undoStore } from "./state/undo";
  import AutoSaveController from "./persistence/AutoSaveController.svelte";
  import DisplayOptions from "./options/displayOptions/DisplayOptions.svelte";
  import TrackInfo from "./trackInfo/TrackInfo.svelte";
  import toCss from "react-style-object-to-css";

  function keyPressed(event: KeyboardEvent) {
    if (event.key === " ") {
      console.log(event);
      if (event.target !== null && "tagName" in event.target) {
        const tagName: string = event.target["tagName"];
        if (tagName !== "INPUT" && tagName !== "TEXTAREA") {
          event.preventDefault();
          togglePlayback();
        }
      }
    } else if (event.key === "z" && event.ctrlKey) {
      event.preventDefault();
      undoStore.undo();
    }
  }
</script>

<style>
  .grid {
    display: grid;
    grid-template-rows: 1fr 46px;
    height: 100vh;
    width: 100vw;
  }

  :global(body) {
    padding: 0;
    margin: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    position: fixed;
  }

  :global(a) {
    color: #c3e88d;
  }

  :global(a:active) {
    color: #c3e88d;
  }

  :global(a:visited) {
    color: #c3e88d;
  }
</style>

<svelte:body on:keypress={keyPressed} />

<Modal>
  <AutoSaveController />
  <ModalController />
  <div
    class="grid"
    style={toCss({
      color: colorLookup.text,
      gridTemplateColumns: `${$splitStore}fr ${100 - $splitStore}fr ${
        $showSidebarStore ? '300px' : ''
      }`,
    })}>
    {#if !$showSidebarStore}
      <div
        style={toCss({
          position: 'fixed',
          top: 8,
          right: 8,
          color: colorLookup.text,
          fontSize: 20,
          fontWeight: 600,
          opacity: 50,
          cursor: 'pointer',
          zIndex: 999,
        })}
        on:click|capture={() => showSidebarStore.set(true)}>
        &lt;
      </div>
    {/if}
    <div
      style={toCss({
        gridColumn: '1',
        gridRow: '1',
        minHeight: 0,
        display: $splitStore === 0 ? 'none' : 'initial',
      })}>
      <Track />
    </div>
    <div
      style={toCss({
        position: 'relative',
        gridColumn: '2',
        gridRow: '1',
        minHeight: 0,
        display: $splitStore === 100 ? 'none' : 'initial',
      })}>
      <TreeVis />
    </div>
    <div
      style={toCss({ gridColumn: '1 / span 3', gridRow: '2', minHeight: 0 })}>
      <TrackControls />
    </div>
    {#if $showSidebarStore}
      <div
        style={toCss({
          position: 'relative',
          gridColumn: '3',
          gridRow: '1',
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: colorLookup.bgDark,
          borderLeft: `1px solid ${colorLookup.border}`,
          padding: 12,
        })}>
        <div
          style={toCss({
            position: 'absolute',
            top: 8,
            left: 8,
            color: colorLookup.text,
            fontSize: 20,
            fontWeight: 600,
            opacity: 50,
            cursor: 'pointer',
          })}
          on:click={() => showSidebarStore.set(false)}>
          &gt;
        </div>
        <h1
          style={toCss({
            textAlign: 'center',
            color: colorLookup.text,
            margin: 0,
          })}>
          Options
        </h1>
        <GenerationOptions />
        <DisplayOptions />
        <TrackInfo />
      </div>
    {/if}
  </div>
</Modal>
