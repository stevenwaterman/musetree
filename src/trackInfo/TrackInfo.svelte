<script>
    import {selectedBranchStore, selectedEncodingStore, root} from "../state/trackTree";
    import colorLookup from "../colors";
    import {getInstrumentPrevalences, getMaxSilence, getNumberOfNotes, getNumberOfTokens, getSilences} from "./stats";
    import {getPitchRange} from "../track/pitches";
    import Button from "../buttons/Button.svelte";
    import Tooltip from "../tooltips/Tooltip.svelte";

    $: selectedSectionsStore = root.selectedSectionsStore;
    $: selectedSections = $selectedSectionsStore;

    let useTrack = true;

    function selectTrack() {
        useTrack = true;
    }

    function selectSection() {
        useTrack = false;
    }

    $: sections = selectedSections === null ? null : selectedSections.length === 0 ? null : useTrack ? selectedSections : [selectedSections[selectedSections.length - 1]];

    $: startsAt = sections === null ? null : sections[0].startsAt;
    $: endsAt = sections === null ? null : sections[sections.length - 1].endsAt;
    $: songLength = sections === null ? null : (endsAt - startsAt).toFixed(1);

    $: numberOfTokens = sections === null ? null : getNumberOfTokens(sections);
    $: numberOfNotes = sections === null ? null : getNumberOfNotes(sections);

    $: pitchRange = sections === null ? null : getPitchRange(sections);
    $: silences = sections === null ? null : getSilences(sections);
    $: maxSilence = silences === null ? null : getMaxSilence(silences);
    $: maxSilenceSeconds = maxSilence === null ? 0 : (maxSilence.endTime - maxSilence.startTime).toFixed(1);

    $: instrumentPrevalences = sections === null ? null : getInstrumentPrevalences(sections);
    $: instrumentBars = instrumentPrevalences === null ? null : Object.entries(instrumentPrevalences);
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
    <span style={"margin: 12px auto 0 auto; color: " + colorLookup.textDark}>Nothing Selected</span>
{:else}
    <div class="row" style="justify-content: space-around">
        <Button on:click={selectTrack} emphasise={useTrack} style="font-size: 10pt">Track</Button>
        <Button on:click={selectSection} emphasise={!useTrack} style="font-size: 10pt">Section</Button>
    </div>

    <div class="mainCol" style={"color: " + colorLookup.textDark}>
        <div class="row">
            <span class="label">Length:</span>
            <div class="col">
                <span class="value">{numberOfTokens} tokens</span>
                <span class="value">{numberOfNotes} notes</span>
                <span class="value">{songLength} sec</span>
            </div>
        </div>

        <div class="spacer"></div>

        <div class="row">
            <span class="label">Pitch:</span>
            {#if pitchRange.minPitch !== -1}
                <span class="value">{pitchRange.minPitch} - {pitchRange.maxPitch}</span>
            {/if}
        </div>

        <div class="spacer"></div>

        <div class="row">
            <span class="label">Max Silence:</span>
            <span class="value">{maxSilenceSeconds} sec</span>
        </div>

        <div class="spacer"></div>

        <div class="row" style="justify-content: center">
            <span class="label" style={`color: ${colorLookup.text}`}>Instrument Use</span>
        </div>

        <div style="display: grid; grid-template-columns: auto 1fr; align-items: center; grid-column-gap: 12px">
            <Tooltip>
                <span class="label" slot="trigger">Note Count:</span>
                <span slot="content">Based on the number of notes for that instrument</span>
            </Tooltip>

            <div class="instrumentBar">
                {#each instrumentBars as [instrument, values]}
                    {#if values["noteCount"] > 0}
                        <div class="bar"
                             style={`background-color: ${colorLookup[instrument]}; flex-grow: ${values["noteCount"]}`}></div>
                    {/if}
                {/each}
            </div>

            <Tooltip>
                <span class="label" slot="trigger">Note Length:</span>
                <span slot="content">Based on the total length of all notes for that instrument</span>
            </Tooltip>
            <div class="instrumentBar">
                {#each instrumentBars as [instrument, values]}
                    {#if values["totalPlayingTime"] > 0}
                        <div class="bar"
                             style={`background-color: ${colorLookup[instrument]}; flex-grow: ${values["totalPlayingTime"]*1000}`}></div>
                    {/if}
                {/each}
            </div>

            <Tooltip>
                <span class="label" slot="trigger">Active Time:</span>
                <span slot="content">Based on how much of the time that instrument is making noise</span>
            </Tooltip>
            <div class="instrumentBar">
                {#each instrumentBars as [instrument, values]}
                    {#if values["nonSilenceTime"] > 0}
                        <div class="bar"
                             style={`background-color: ${colorLookup[instrument]}; flex-grow: ${values["nonSilenceTime"]*1000}`}></div>
                    {/if}
                {/each}
            </div>
        </div>
    </div>
{/if}