<script>
    import colorLookup from "../colors";
    import {root} from "../state/trackTree";
    import {getInstrumentPrevalences} from "./stats";

    $: selectedSectionsStore = root.selectedSectionsStore;
    $: selectedSections = $selectedSectionsStore;
    $: instrumentPrevalences = getInstrumentPrevalences(selectedSections);

    const key = "noteCount";
    $: bars = Object.entries(instrumentPrevalences).map(([instrument, prevalences]) => ([instrument, prevalences[key]]));
</script>

<style>
    .bars {
        display: flex;
        flex-direction: row;
    }

    .bar {
        position: relative;
        height: 10px;
    }
</style>

<div class="bars" style={`color: ${colorLookup.textEmphasis}`}>
    {#each bars as [instrument, grow]}
        {#if grow > 0}
            <div class="bar" style={`background-color: ${colorLookup[instrument]}; flex-grow: ${grow}`}/>
        {/if}
    {/each}
</div>
