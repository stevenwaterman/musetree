<script>
    import {selectedBranchStore, selectedEncodingStore, root} from "../state/trackTree";
    import colorLookup from "../colors";
    import {getMaxSilence, getNumberOfNotes, getSilences} from "./stats";
    import {getPitchRange} from "../track/pitches";
    import Button from "../buttons/Button.svelte";
    import InstrumentPrevalence from "./InstrumentPrevalence.svelte";

    $: selectedSectionsStore = root.selectedSectionsStore;
    $: selectedSections = $selectedSectionsStore;
    $: startsAt = selectedSections === null ? null : selectedSections.length === 0 ? null : selectedSections[0].startsAt;
    $: endsAt = selectedSections === null ? null : selectedSections.length === 0 ? null : selectedSections[selectedSections.length - 1].endsAt;
    $: songLength = (endsAt - startsAt).toFixed(1);

    $: numberOfNotes = selectedSections === null ? null : getNumberOfNotes(selectedSections);

    $: pitchRange = selectedSections === null ? null : getPitchRange(selectedSections);
    $: silences = selectedSections === null ? null : getSilences(selectedSections);
    $: maxSilence = silences === null ? null : getMaxSilence(silences);
    $: maxSilenceSeconds = maxSilence === null ? 0 : (maxSilence.endTime - maxSilence.startTime).toFixed(1);
</script>

<style>
    h1 {
        text-align: center;
        margin: 12px 0 0 0;
    }

    .infoGrid {
        margin-top: 12px;
        display: grid;
        grid-template-columns: auto auto;
        justify-content: space-between;
        align-items: center;
        row-gap: 8px;
    }

    .label {
        font-weight: 600;
    }

    .value {

    }
</style>

<h1>Track Info</h1>

{#if $selectedBranchStore === null}
    <span style={"margin: 12px auto 0 auto; color: " + colorLookup.textDark}>Nothing Selected</span>
{:else}
    <div class="infoGrid" style={"color: " + colorLookup.textDark}>
        <span class="label">Length:</span>
        <div style="display: flex; flex-direction: column">
            <span class="value">{$selectedEncodingStore.length} tokens</span>
            <span class="value">{numberOfNotes} notes</span>
            <span class="value">{songLength} sec</span>
        </div>

        <span class="label">Pitch:</span>
        <div style="display: flex; flex-direction: column">
            <span class="value">{pitchRange.minPitch} - {pitchRange.maxPitch}</span>
        </div>

        <span class="label">Max Silence:</span>
        <div style="display: flex; flex-direction: column">
            <span class="value">{maxSilenceSeconds} sec</span>
        </div>

        <span class="label">Instrument Use:</span>
    </div>

    <InstrumentPrevalence/>

{/if}