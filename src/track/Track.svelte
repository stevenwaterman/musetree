<script lang="ts">
  import SectionCanvas from "./SectionCanvas.svelte";
  import { isScrollingStore, yScaleStore } from "../state/settings";
  import { root } from "../state/trackTree";
  import Timeline from "./Timeline.svelte";
  import colorLookup from "../colors";
  import { getPitchRange } from "./pitches";
  import type { Section } from "../state/section";
  import type { Readable } from "svelte/store"
  import toCss from "react-style-object-to-css"

  let selectedSectionsStore: Readable<Section[]>;
  $: selectedSectionsStore = root.selectedSectionsStore;

  let selectedSections: Section[];
  $: selectedSections = $selectedSectionsStore;

  let pitchRange: {
    minPitch: number;
    maxPitch: number;
  };
  $: pitchRange = getPitchRange(selectedSections);

  let viewport: HTMLDivElement | undefined;

  function scroll(sections: Section[]) {
    if (sections && sections.length) {
      const lastSection: Section = sections[sections.length - 1];
      const startsAt: number = lastSection.startsAt;
      setTimeout(() => {
        if (viewport) viewport.scrollTop = startsAt * $yScaleStore;
      }, 0);
    }
  }

  $: scroll(selectedSections);
</script>

<style>
  .container {
    position: relative;
    overflow-y: scroll;
    scrollbar-color: #c3cee3 #1f292e;
    height: 100%;
  }

  .container::-webkit-scrollbar {
    width: 10px;
  }

  .container::-webkit-scrollbar-track {
    background: #1f292e;
  }

  .container::-webkit-scrollbar-thumb {
    background-color: #c3cee3;
  }

  .placeholder {
    text-align: center;
  }
</style>

<div
  class="container"
  bind:this={viewport}
  on:wheel={() => isScrollingStore.set(false)}
  style={toCss({backgroundColor: colorLookup.bgDark})}>
  <Timeline />
  {#each selectedSections as section}
    {#if viewport !== undefined}
      <SectionCanvas
        {viewport}
        {section}
        pitchMin={pitchRange.minPitch}
        pitchMax={pitchRange.maxPitch} />
    {/if}
  {:else}
    <p class="placeholder">Right click the root to begin</p>
  {/each}

</div>
