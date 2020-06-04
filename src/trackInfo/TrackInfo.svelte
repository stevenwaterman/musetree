<script>
    import {selectedBranchStore, selectedEncodingStore, root} from "../state/trackTree";
    import colorLookup from "../colors";
    import {getInstrumentPrevalences, getMaxSilence, getNumberOfNotes, getNumberOfTokens, getSilences} from "./stats";
    import {getPitchRange} from "../track/pitches";
    import Button from "../buttons/Button.svelte";

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

    const tt_text_style = "border: 1px solid " + colorLookup.border + "; background-color: " + colorLookup.bgLight;
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

    .TT_trigger {
    }

    .TT_text {
        visibility: hidden;
        padding: 5px;
        font-weight: 400;
        font-size: 12px;
        margin-left: 12px;

        position: absolute;
        z-index: 1;
    }

    .TT_trigger:hover .TT_text {
        visibility: visible;
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
            <span class="label TT_trigger">
                Note Count:
                <span class="TT_text" style={tt_text_style}>Based on the number of notes for that instrument</span>
            </span>
            <div class="instrumentBar">
                {#each instrumentBars as [instrument, values]}
                    {#if values["noteCount"] > 0}
                        <div class="bar" style={`background-color: ${colorLookup[instrument]}; flex-grow: ${values["noteCount"]}`}></div>
                    {/if}
                {/each}
            </div>

            <span class="label TT_trigger">
                Note Length:
                <span class="TT_text"  style={tt_text_style}>Based on the total length of all notes for that instrument</span>
            </span>
            <div class="instrumentBar">
                {#each instrumentBars as [instrument, values]}
                    {#if values["totalPlayingTime"] > 0}
                        <div class="bar" style={`background-color: ${colorLookup[instrument]}; flex-grow: ${values["totalPlayingTime"]*1000}`}></div>
                    {/if}
                {/each}
            </div>

            <span class="label TT_trigger">
                Active Time:
                <span class="TT_text" style={tt_text_style}>Based on how much of the time that instrument is making noise</span>
            </span>
            <div class="instrumentBar">
                {#each instrumentBars as [instrument, values]}
                    {#if values["nonSilenceTime"] > 0}
                        <div class="bar" style={`background-color: ${colorLookup[instrument]}; flex-grow: ${values["nonSilenceTime"]*1000}`}></div>
                    {/if}
                {/each}
            </div>
        </div>
    </div>
{/if}