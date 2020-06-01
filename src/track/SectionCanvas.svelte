<script>
    import {yScaleStore} from "../state/settings";
    import {instruments} from "../constants";
    import {afterUpdate} from "svelte";
    import {root} from "../state/trackTree";
    import * as Audio from "../audio/audioPlayer";
    import colorLookup from "../colors";
    import VisibilityGuard from "./VisibilityGuard.svelte";

    export let viewport;
    export let section;
    export let index;
    export let pitchMin;
    export let pitchMax;
    $: pitchRange = pitchMax - pitchMin;

    $: startsAt = section ? section.startsAt : null;
    $: sectionDuration = section ? section.endsAt - startsAt : 0;
    $: height = sectionDuration * $yScaleStore;
    $: top = section.startsAt * $yScaleStore;

    $: notes = section ? section.notes : null;

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
    }

    .sectionContainer {
        width: 100%;
        position: absolute;
        box-sizing: border-box;
        flex-shrink: 0;
        flex-grow: 0;
        left: 0;
    }

    .label {
        position: absolute;
        top: 4px;
        right: 4px;
        display: inline;
        z-index: 2;
    }
</style>

{#if notes}
    <div class="sectionContainer"
         style={`border-right: 1px solid ${colorLookup.border}; border-bottom: 1px solid ${colorLookup.border}; height: ${height}px; top: ${top}px`}>
        <VisibilityGuard root={viewport} let:loaded>
            {#if loaded}
                <span class="label" style={"color: " + colorLookup.text}>Section {index + 1}</span>
                <svg viewBox={`${pitchMin} 0 ${pitchRange + 2} ${sectionDuration}`} width="100%"
                     height={Math.floor(height-1)} style={`background-color: ${colorLookup.bgLight}`}
                     class="sectionCanvas" preserveAspectRatio="none" on:click={play}>
                    {#each Object.entries(notes) as [instrument, instrumentNotes], idx}
                        {#each instrumentNotes as note}
                            <rect x={note.pitch + idx / instruments.length} width="1" y={note.startTime}
                                  height={note.endTime-note.startTime} fill={colorLookup[instrument]}
                                  stroke={colorLookup.border} stroke-width="1px" vector-effect="non-scaling-stroke"/>
                        {/each}
                    {/each}
                </svg>
            {/if}
        </VisibilityGuard>
    </div>
{/if}

