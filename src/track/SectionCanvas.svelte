<script lang="ts">
  import type {
    ProcessedNotes,
    ProcessedActiveNotes,
  } from "../bridge/postProcessor";
  import { yScaleStore } from "../state/settings";
  import { instruments } from "../constants";
  import type { Instrument } from "../constants";
  import * as Audio from "../audio/audioPlayer";
  import colorLookup, { allInstrumentsVisibility } from "../colors";
  import VisibilityGuard from "./VisibilityGuard.svelte";
  import type { Section } from "../state/section";
  import toCss from "react-style-object-to-css";
  import type { CompleteNote, IncompleteNote } from "../bridge/decoder";

  export let viewport: HTMLDivElement;
  export let section: Section;
  export let pitchMin: number;
  export let pitchMax: number;

  let pitchRange: number;
  $: pitchRange = pitchMax - pitchMin;

  let startsAt: number | null;
  $: startsAt = section ? section.startsAt : null;

  let sectionDuration: number;
  $: sectionDuration =
    section !== null && startsAt !== null ? section.endsAt - startsAt : 0;

  let height: number;
  $: height = sectionDuration * $yScaleStore;

  let top: number;
  $: top = (startsAt || 0) * $yScaleStore;

  let notes: ProcessedNotes | null;
  $: notes = section ? section.notes : null;

  let activeNotes: ProcessedActiveNotes | null;
  $: activeNotes = section ? section.activeNotesAtEnd : null;

  let incompleteNoteEntries: Array<[Instrument, IncompleteNote[]]> | null;
  $: incompleteNoteEntries = activeNotes
    ? Object.entries(activeNotes).map(([instrument, pitchMap]) => [
        instrument as Instrument,
        Object.values(pitchMap),
      ])
    : null;

  let completeNoteEntries: Array<[Instrument, CompleteNote[]]> | null;
  $: completeNoteEntries = notes
    ? (Object.entries(notes) as Array<[Instrument, CompleteNote[]]>)
    : null;

  function play(
    event: MouseEvent & {
      target: EventTarget & SVGSVGElement;
    }
  ) {
    const rect: { top: number; left: number } =
      event.target.getBoundingClientRect();
    const y: number = event.clientX - rect.left;
    const fraction: number = y / height;
    const addDuration: number = sectionDuration * fraction;
    const totalDuration: number = section.startsAt + addDuration;
    Audio.play(totalDuration);
  }

  let svgStyle: JSX.CSSProperties;
  $: svgStyle = toCss({ backgroundColor: colorLookup.bgLight }) as any;
</script>

{#if notes !== null}
  <div
    class={["sectionContainer", "borders"].join(" ")}
    style={toCss({ borderColor: colorLookup.border })}
  >
    <VisibilityGuard root={viewport} let:loaded>
      {#if loaded}
        <svg
          viewBox={`0 ${pitchMin} ${sectionDuration} ${pitchRange + 2}`}
          width={Math.floor(height - 1)}
          height="100%"
          style={svgStyle}
          class="sectionCanvas"
          preserveAspectRatio="none"
          on:click={play}
        >
          {#if completeNoteEntries !== null}
            {#each completeNoteEntries as [instrument, instrumentNotes], idx}
              {#if $allInstrumentsVisibility[instrument]}
                {#each instrumentNotes as note}
                  <rect
                    x={note.startTime}
                    width={note.endTime - note.startTime}
                    y={pitchMax -
                      (note.pitch - pitchMin + idx / instruments.length)}
                    height="1"
                    fill={colorLookup[instrument]}
                    stroke={colorLookup.border}
                    stroke-width="1px"
                    vector-effect="non-scaling-stroke"
                  />
                {/each}
              {/if}
            {/each}
          {/if}
        </svg>
      {/if}
    </VisibilityGuard>
  </div>
{/if}

<style>
  .sectionCanvas {
    position: relative;
    cursor: pointer;
  }

  .sectionContainer {
    box-sizing: border-box;
    flex-shrink: 0;
    flex-grow: 0;
  }

  .borders {
    border-right: 1px solid;
    border-bottom: 1px solid;
  }
</style>
