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
  import { audio } from "./audio.js";

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
      drawInstrument(
        ctx,
        instrumentNotes,
        color,
        yScale,
        idx / instruments.length
      );
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

  function play(event) {
      const rect = event.target.getBoundingClientRect();
      const y = event.clientY - rect.top;
    const fraction = y / height;
    const addDuration = $trackStore.track.sectionDuration * fraction;
    const totalDuration =
      $trackStore.track.duration -
      $trackStore.track.sectionDuration +
      addDuration;
    audio.seek(totalDuration);
    audio.play();
  }
</script>

<style>
  .trackCanvas {
    background-color: #ccf;
    flex-grow: 0;
    flex-shrink: 0;
  }
</style>

<canvas
  class="trackCanvas"
  on:click={play}
  bind:this={canvas}
  width={canvasWidth}
  {height} />
