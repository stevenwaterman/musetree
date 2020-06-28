<script lang="ts">
  import { root } from "../state/trackTree";
  import colorLookup from "../colors";
  import {
    getInstrumentPrevalences,
    getMaxSilence,
    getNumberOfNotes,
    getNumberOfTokens,
    getSilences,
  } from "./stats";
  import { getPitchRange } from "../track/pitches";
  import Button from "../buttons/Button.svelte";
  import Tooltip from "../tooltips/Tooltip.svelte";
  import type { Section } from "../state/section";
  import type { Instrument } from "../constants";
  import type { Readable } from "svelte/store"
  import toCss from "react-style-object-to-css";

  let selectedSectionsStore: Readable<Section[]>;
  $: selectedSectionsStore = root.selectedSectionsStore;

  let selectedSections: Section[];
  $: selectedSections = $selectedSectionsStore;

  let useTrack: boolean = true;

  function selectTrack() {
    useTrack = true;
  }

  function selectSection() {
    useTrack = false;
  }

  let sections: Section[] | null;
  $: sections =
    selectedSections === null
      ? null
      : selectedSections.length === 0
      ? null
      : useTrack
      ? selectedSections
      : [selectedSections[selectedSections.length - 1]];

  let startsAt: number | null;
  $: startsAt = sections === null ? null : sections[0].startsAt;

  let endsAt: number | null;
  $: endsAt = sections === null ? null : sections[sections.length - 1].endsAt;

  let songLength: string;
  $: songLength = startsAt !== null && endsAt !== null ? (endsAt - startsAt).toFixed(1) : "0.0";

  let numberOfTokens: number | null;
  $: numberOfTokens = sections ? getNumberOfTokens(sections) : null;

  let numberOfNotes: number | null;
  $: numberOfNotes = sections ? getNumberOfNotes(sections) : null;

  let pitchRange: { minPitch: number; maxPitch: number } | null;
  $: pitchRange = sections === null ? null : getPitchRange(sections);

  let silences:
    | {
        startTime: number;
        endTime: number;
      }[]
    | null;
  $: silences = sections === null ? null : getSilences(sections);

  let maxSilence: { startTime: number; endTime: number } | null;
  $: maxSilence = silences === null ? null : getMaxSilence(silences);

  let maxSilenceSeconds: string;
  $: maxSilenceSeconds =
    maxSilence === null
      ? "0"
      : (maxSilence.endTime - maxSilence.startTime).toFixed(1);

  let instrumentPrevalences: Record<
    Instrument,
    {
      noteCount: number;
      totalPlayingTime: number;
      nonSilenceTime: number;
    }
  > | null;
  $: instrumentPrevalences =
    sections === null ? null : getInstrumentPrevalences(sections);

  let instrumentBars: Array<
    [
      Instrument,
      {
        noteCount: number;
        totalPlayingTime: number;
        nonSilenceTime: number;
      }
    ]
  > | null;
  $: instrumentBars =
    instrumentPrevalences === null
      ? null
      : (Object.entries(instrumentPrevalences) as Array<
          [
            Instrument,
            {
              noteCount: number;
              totalPlayingTime: number;
              nonSilenceTime: number;
            }
          ]
        >);
</script>

<style>
  h1 {
    text-align: center;
    margin: 12px 0 0 0;
  }

  .mainCol {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .col {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .label {
    font-weight: 600;
  }

  .value {
    text-align: right;
  }

  .instrumentBar {
    display: flex;
    flex-direction: row;
    height: 10px;
    flex-grow: 1;
  }

  .spacer {
    height: 12px;
  }
</style>

<h1>Stats</h1>

{#if sections === null}
  <span style={toCss({margin: "12px auto 0 auto", color: colorLookup.textDark})}>
    Nothing Selected
  </span>
{:else}
  <div class="row" style="justify-content: space-around">
    <Button on:click={selectTrack} emphasise={useTrack} style="font-size: 10pt">
      Track
    </Button>
    <Button
      on:click={selectSection}
      emphasise={!useTrack}
      style="font-size: 10pt">
      Section
    </Button>
  </div>

  <div class="mainCol" style={toCss({color: colorLookup.textDark})}>
    <div class="row">
      <span class="label">Length:</span>
      <div class="col">
        <span class="value">{numberOfTokens} tokens</span>
        <span class="value">{numberOfNotes} notes</span>
        <span class="value">{songLength} sec</span>
      </div>
    </div>

    <div class="spacer" />

    <div class="row">
      <span class="label">Pitch:</span>
      {#if pitchRange !== null && pitchRange.minPitch !== -1}
        <span class="value">{pitchRange.minPitch} - {pitchRange.maxPitch}</span>
      {/if}
    </div>

    <div class="spacer" />

    <div class="row">
      <span class="label">Max Silence:</span>
      <span class="value">{maxSilenceSeconds} sec</span>
    </div>

    <div class="spacer" />

    <div class="row" style="justify-content: center">
      <span class="label" style={toCss({color: colorLookup.text})}>
        Instrument Use
      </span>
    </div>

    <div
      style="display: grid; grid-template-columns: auto 1fr; align-items:
      center; grid-column-gap: 12px">
      <Tooltip>
        <span class="label" slot="trigger">Note Count:</span>
        <span>
          Based on the number of notes for that instrument
        </span>
      </Tooltip>

      <div class="instrumentBar">
        {#if instrumentBars}
          {#each instrumentBars as [instrument, values]}
            {#if values['noteCount'] > 0}
              <div
                class="bar"
                style={toCss({backgroundColor: colorLookup[instrument], flexGrow: values['noteCount']})} />
            {/if}
          {/each}
        {/if}
      </div>

      <Tooltip>
        <span class="label" slot="trigger">Note Length:</span>
        <span>
          Based on the total length of all notes for that instrument
        </span>
      </Tooltip>
      <div class="instrumentBar">
        {#if instrumentBars}
          {#each instrumentBars as [instrument, values]}
            {#if values['totalPlayingTime'] > 0}
              <div
                class="bar"
                style={toCss({backgroundColor: colorLookup[instrument], flexGrow: values['totalPlayingTime'] * 1000})} />
            {/if}
          {/each}
        {/if}
      </div>

      <Tooltip>
        <span class="label" slot="trigger">Active Time:</span>
        <span>
          Based on how much of the time that instrument is making noise
        </span>
      </Tooltip>
      <div class="instrumentBar">
        {#if instrumentBars}
          {#each instrumentBars as [instrument, values]}
            {#if values['nonSilenceTime'] > 0}
              <div
                class="bar"
                style={toCss({backgroundColor: colorLookup[instrument], flexGrow: values['nonSilenceTime'] * 1000})} />
            {/if}
          {/each}
        {/if}
      </div>
    </div>
  </div>
{/if}
