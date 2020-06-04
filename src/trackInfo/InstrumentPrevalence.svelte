<script>
    import colorLookup from "../colors";
    import {instruments} from "../constants";
    import {root} from "../state/trackTree";
    import {getInstrumentPrevalences} from "./stats";

    $: selectedSectionsStore = root.selectedSectionsStore;
    $: selectedSections = $selectedSectionsStore;
    $: instrumentPrevalences = getInstrumentPrevalences(selectedSections);

    const key = "noteCount";
    $: maxValue = Math.max(...instruments.map(instrument => instrumentPrevalences[instrument][key]));
    $: barWidths = Object.entries(instrumentPrevalences).map(([instrument, prevalences]) => ([instrument, prevalences[key] / maxValue])).filter(([_, width]) => width !== 0).sort((a, b) => b[1] - a[1]);
</script>

<style>
    span {
        white-space: nowrap;
        mix-blend-mode: screen;
        color: #888;
    }

    .bars {
        display: grid;
        grid-template-columns: 1fr;
        grid-row-gap: 4px;
    }
</style>

<div class="bars" style={`color: ${colorLookup.textEmphasis}`}>
    {#each barWidths as [instrument, width]}
        <div class="barBackground">
            <div class="bar" style={`background-color: ${colorLookup[instrument]}; width: ${width*100}%`}>
                <span>{instrument}</span>
            </div>
        </div>
    {/each}
</div>