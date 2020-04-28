<script>
  import {yScaleStore} from "../state/settings";
  import {pitchRange, pitchMin, instrumentSettings} from "../constants";
  import {afterUpdate} from "svelte";
  import {root} from "../state/trackTree";
  import * as Audio from "../synth/audioPlayer";

  export let branchStore;
  export let section;
  export let deselect;

  let canvas;
  let clientWidth;
  let clientHeight;
  $: xScale = clientWidth / pitchRange;

  $: branchState = $branchStore;
  $: path = branchState.path;
  $: index = path[path.length - 1];
  $: section = branchState === null ? null : branchState.section;
  $: notes = section === null ? null : section.notes;
  $: startsAt = section ? section.startsAt : null;
  $: sectionDuration = section ? section.endsAt - startsAt : 0;
  $: height = sectionDuration * $yScaleStore;
  $: position = startsAt * $yScaleStore;

  $: selectedChildStore_2 = branchStore.selectedChildStore_2;
  $: selectedChildStore = $selectedChildStore_2;


  afterUpdate(() => setTimeout(draw, 0));

  function draw() {
    if (canvas == null || notes == null) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const border = "white";
    ctx.strokeStyle = border;
    ctx.lineWidth = 1;
    ctx.moveTo(0, canvas.height - 0.5);
    ctx.lineTo(canvas.width, canvas.height - 0.5);
    ctx.stroke();

    Object.keys(notes).forEach((instrument, idx) => {
      const instrumentNotes = notes[instrument];
      const settings = instrumentSettings[instrument];
      const {color} = settings;

      drawInstrument(
              ctx,
              instrumentNotes,
              color,
              idx / Object.keys(instrumentSettings).length,
              "black"
      );
    });

    ctx.fillStyle = "white";
    ctx.textAlign = "right";
    ctx.font = "14px arial";
    const text = `Section ${section + 1}: ${index}`;
    ctx.fillText(text, canvas.width - 2.5, 12.5);
  }

  function drawInstrument(ctx, notes, color, xOffset, background) {
    ctx.fillStyle = color;
    ctx.strokeStyle = background;
    ctx.lineWidth = 1;

    notes.forEach(note => {
      const xStart =
              Math.round((xOffset + note.pitch - pitchMin) * xScale) + 0.5;
      const yStart = Math.round(note.time_on * $yScaleStore) + 0.5;
      const noteWidth = Math.round(xScale);
      const noteHeight = Math.round(note.duration * $yScaleStore);
      ctx.fillRect(xStart, yStart, noteWidth, noteHeight);
      if (noteHeight > 2) ctx.strokeRect(xStart, yStart, noteWidth, noteHeight);
    });
  }

  function play(event) {
    const rect = event.target.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const fraction = y / height;
    const addDuration = sectionDuration * fraction;
    const totalDuration = section.startsAt + addDuration;
    Audio.play(totalDuration);
  }
</script>

<style>
  .sectionCanvas {
    position: relative;
    cursor: pointer;
    width: 100%;
    margin-top: -3px;
  }
</style>

{#if notes}
  <canvas
    bind:clientWidth
    bind:clientHeight
    class="sectionCanvas"
    on:click="{play}"
    on:contextmenu|preventDefault={deselect()}
    bind:this={canvas}
    width={clientWidth}
    {height}>
    HTML5 Canvas not Supported
  </canvas>
{/if}

{#if selectedChildStore !== null}
  <svelte:self branchStore={selectedChildStore} section={section + 1} deselect="{() => root.select(path)}"/>
{/if}
