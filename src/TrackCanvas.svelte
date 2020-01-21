<script>
  import {
    deriveTrackStore,
    trackTreeStore,
    selectedPathStore,
    selectedTrackAudioStore,
    selectedTrackEncodingStore
  } from "./trackTree.js";
  import { afterUpdate } from "svelte";
  import { configStore } from "./settings.js";
  import {
    instruments,
    instrumentSettings,
    pitchMin,
    yScaleStore,
    canvasWidth,
    xScale
  } from "./constants.js";

  export let path;
  let canvas;

  $: trackStore = deriveTrackStore(path);
  $: notes = $trackStore.track.notes;

  $: height = $trackStore.track.sectionDuration * $yScaleStore;
  $: draw(canvas, notes, $yScaleStore);

  afterUpdate(async () => {
    draw(canvas, notes, $yScaleStore);
  });

  function draw(canvas, notes, yScale) {
    if (canvas == null) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    instruments.forEach((instrument, idx) => {
      const instrumentNotes = notes[instrument];
      const color = instrumentSettings[instrument].color;
      drawInstrument(ctx, instrumentNotes, color, yScale, idx / instruments.length);
    });
  }

  function drawInstrument(ctx, notes, color, yScale, xOffset) {
    ctx.fillStyle = color;
    notes.forEach(note => {
      const xStart = (xOffset + note.pitch - pitchMin) * xScale;
      const yStart = note.time_on * yScale;
      const noteWidth = xScale - 1;
      const noteHeight = note.duration * yScale - 1;
      ctx.fillRect(xStart, yStart, noteWidth, noteHeight);
    });
  }
</script>

<style>
  .trackCanvas {
  }
</style>

<canvas class="trackCanvas" bind:this={canvas} width={canvasWidth} {height} />
