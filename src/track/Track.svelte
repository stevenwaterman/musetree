<script>
    import SectionCanvas from "./SectionCanvas.svelte";
    import {isScrollingStore, yScaleStore} from "../state/settings";
    import {root} from "../state/trackTree";
    import Timeline from "./Timeline.svelte";
    import colorLookup from "../colors";
    import {getPitchRange} from "./pitches";

    $: selectedSectionsStore = root.selectedSectionsStore;
    $: selectedSections = $selectedSectionsStore;

    $: pitchRange = getPitchRange(selectedSections)

    let viewport;

    function scroll(sections) {
        if(sections && sections.length) {
            const lastSection = sections[sections.length - 1];
            const startsAt = lastSection.startsAt;
            setTimeout(() => {
                viewport.scrollTop = startsAt * $yScaleStore;
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

<div class="container" bind:this={viewport} on:wheel={() => isScrollingStore.set(false)} style={"background-color: " + colorLookup.bgDark}>
    <Timeline/>
    {#each selectedSections as section, idx}
        <SectionCanvas viewport={viewport} section={section} index={idx} pitchMin={pitchRange.minPitch} pitchMax={pitchRange.maxPitch}/>
    {:else}
        <p class="placeholder">Use the controls below to begin</p>
    {/each}
</div>
