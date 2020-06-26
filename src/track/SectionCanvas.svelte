<script lang="ts">
  import { yScaleStore } from "../state/settings";
  import { instruments } from "../constants";
  import type { Instrument } from "../constants";
  import * as Audio from "../audio/audioPlayer";
  import colorLookup, { allInstrumentsVisibility } from "../colors";
  import VisibilityGuard from "./VisibilityGuard.svelte";
  import type { Section } from "../state/section";
  import type { Notes, Note } from "../state/notes";

  export let viewport: HTMLDivElement;
  export let section: Section;
  export let pitchMin: number;
  export let pitchMax: number;

  let pitchRange: number;
  $: pitchRange = pitchMax - pitchMin;

  let startsAt: number | null;
  $: startsAt = section ? section.startsAt : null;

  let sectionDuration: number;
  $: sectionDuration = section && startsAt ? section.endsAt - startsAt : 0;

  let height: number;
  $: height = sectionDuration * $yScaleStore;

  let top: number;
  $: top = (startsAt || 0) * $yScaleStore;

  let notes: Notes | null;
  $: notes = section ? section.notes : null;

  let noteEntries: Array<[Instrument, Note[]]> | null;
  $: noteEntries = notes
    ? (Object.entries(notes) as Array<[Instrument, Note[]]>)
    : null;

  function play(
    event: MouseEvent & {
      target: EventTarget & SVGSVGElement;
    }
  ) {
    const rect: { top: number } = event.target.getBoundingClientRect();
    const y: number = event.clientY - rect.top;
    const fraction: number = y / height;
    const addDuration: number = sectionDuration * fraction;
    const totalDuration: number = section.startsAt + addDuration;
    Audio.play(totalDuration);
  }
</script>

<style>
  .sectionCanvas {
    position: relative;
    cursor: pointer;
  }

  .sectionContainer {
    width: 100%;
    position: absolute;
    box-sizing: border-box;
    flex-shrink: 0;
    flex-grow: 0;
    left: 0;
  }
</style>

{#if notes !== null}
  <div
    class="sectionContainer"
    style={`border-right: 1px solid ${colorLookup.border}; border-bottom: 1px solid ${colorLookup.border}; height: ${height}px; top: ${top}px`}>
    <VisibilityGuard root={viewport} let:loaded>
      {#if loaded}
        <svg
          viewBox={`${pitchMin} 0 ${pitchRange + 2} ${sectionDuration}`}
          width="100%"
          height={Math.floor(height - 1)}
          style={{ backgroundColor: colorLookup.bgLight }}
          class="sectionCanvas"
          preserveAspectRatio="none"
          on:click={(event) => {}}>
          {#if noteEntries !== null}
            {#each noteEntries as [instrument, instrumentNotes], idx}
              {#if $allInstrumentsVisibility[instrument]}
                {#each instrumentNotes as note}
                  <rect
                    x={note.pitch + idx / instruments.length}
                    width="1"
                    y={note.startTime}
                    height={(note.type === 'COMPLETE' ? note.endTime : 1 * 1000 * 1000) - note.startTime}
                    fill={colorLookup[instrument]}
                    stroke={colorLookup.border}
                    stroke-width="1px"
                    vector-effect="non-scaling-stroke" />
                {/each}
              {/if}
            {/each}
          {/if}
        </svg>
      {/if}
    </VisibilityGuard>
  </div>
{/if}
