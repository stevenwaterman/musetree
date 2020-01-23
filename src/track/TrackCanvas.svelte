<script>
  import {
    deriveTrackStore,
    trackTreeStore,
    selectedPathStore,
    selectedTrackAudioStore,
    selectedTrackEncodingStore
  } from "./trackTree.js";
  import { afterUpdate } from "svelte";
  import { configStore, yScaleStore } from "../settings.js";
  import {
    instruments,
    instrumentSettings,
    pitchMin,
    canvasWidth,
    xScale
  } from "../constants.js";
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

    const background = "black";
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const border = "white";
    ctx.strokeStyle = border;
    ctx.lineWidth = 1;
    ctx.moveTo(0, canvas.height - 0.5)
    ctx.lineTo(canvas.width, canvas.height - 0.5)
    ctx.stroke();

    Object.keys(notes).forEach((instrument, idx) => {
      const instrumentNotes = notes[instrument];
      const settings = instrumentSettings[instrument];
      const { color } = settings;

      drawInstrument(
        ctx,
        instrumentNotes,
        color,
        yScale,
        idx / instruments.length,
        background
      );
    });
  }

  function drawInstrument(ctx, notes, color, yScale, xOffset, background) {
    ctx.fillStyle = color;
    ctx.strokeStyle = background;
    ctx.lineWidth = 1;

    notes.forEach(note => {
      const xStart =
        Math.round((xOffset + note.pitch - pitchMin) * xScale) + 0.5;
      const yStart = Math.round(note.time_on * yScale) + 0.5;
      const noteWidth = Math.round(xScale);
      const noteHeight = Math.round(note.duration * yScale);
      ctx.fillRect(xStart, yStart, noteWidth, noteHeight);
      if(noteHeight > 2) ctx.strokeRect(xStart, yStart, noteWidth, noteHeight);
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
    audio.play(totalDuration);
  }
</script>

<style>
  .trackCanvas {
    flex-grow: 0;
    flex-shrink: 0;
    cursor: pointer;
    margin-bottom: -4px;
  }
</style>

  <canvas
    class="trackCanvas"
    on:click={play}
    on:contextmenu|preventDefault={trackStore.deselect}
    bind:this={canvas}
    width={canvasWidth}
    style={"width: " + canvasWidth + "px; height: " + height + "px;"}
    {height} />
