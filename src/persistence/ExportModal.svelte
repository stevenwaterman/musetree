<script>
    import {selectedSectionsStore, selectedEncodingStore, selectedBranchStore} from "../state/trackTree";
    import {downloadMuseTreeAudio, downloadMuseNetAudio, downloadMidiAudio} from "./export";
    import colorLookup from "../colors";
    import download from "downloadjs";
    import Button from "../buttons/Button.svelte";
    import {encodingToString} from "../state/encoding";

    export let store;
    $: state = $store;
    $: trackEncoding = state.encoding;
    $: sectionEncoding = state.section.encoding;

    $: trackEncodingString = encodingToString(trackEncoding);
    $: sectionEncodingString = encodingToString(sectionEncoding);

    let fullTrack = true;

    $: encoding = fullTrack ? trackEncodingString : sectionEncodingString;

    let name = "MuseTreeExport";
    let encodingArea;

    function copy() {
        encodingArea.select();
        document.execCommand("copy");
        encodingArea.setSelectionRange(0,0);
    }

    const tt_text_style = "border: 1px solid " + colorLookup.border + "; background-color: " + colorLookup.bgLight + "; color: " + colorLookup.textDark;
</script>

<style>
    h1 {
        margin-top: 0;
    }

    h2 {
        margin-top: 4px;
        margin-bottom: 4px;
    }

    .encoding {
        width: 100%;
        height: 100px;
        scrollbar-color: #c3cee3 #1f292e;
        resize: none;
        margin: 0;
    }

    .copy_trigger {
        position: relative;
    }

    .copy {
        display: none;
        position: absolute;
        inset: 8px 8px 12px 8px;
        border-radius: 24px;
        align-items: center;
        justify-content: center;
    }

    .copy_trigger:hover .copy {
        display: flex;
    }

    .grid {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        grid-gap: 12px;
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

<h1 style={ "color: " + colorLookup.text}>Export</h1>

<div style="display: flex; flex-direction: row; align-items: center; margin-bottom: 12px">
    <label for="exportName">File name:</label>
    <input id="exportName" bind:value={name} type="text" style={"margin-left: 12px; margin-bottom: 0; border: 1px dotted " + colorLookup.border + "; background-color: " + colorLookup.bgLight + "; color: " + colorLookup.text}/>

    <label class="TT_trigger" style="margin-left: 12px">
        Encoding:
        <span class="TT_text" style={tt_text_style}>
            Export the whole track up until that point, or just the one section you clicked?
        </span>
    </label>
    <Button on:click="{() => {fullTrack = true}}" emphasise={fullTrack}>Track</Button>
    <Button on:click="{() => {fullTrack = false}}" emphasise={!fullTrack}>Section</Button>
</div>

<label for="encoding" style="display: none">Encoding</label>
<div class="copy_trigger">
    <textarea bind:this={encodingArea} id="encoding" class="encoding" readonly style={"border: 1px dotted " + colorLookup.border + "; background-color: " + colorLookup.bgLight + "; color: " + colorLookup.text}>{encoding}</textarea>
    <div class="copy" style={"color: " + colorLookup.text + "; background-color: " + colorLookup.bgDark + "99"} on:click={copy}>Click to copy</div>
</div>

<h2 style={"color: " + colorLookup.text}>Export as:</h2>

<div class="grid">
    <span><b style={"color: " + colorLookup.text}>Recommended:</b> Audio as it sounds elsewhere in the app</span>
    <Button on:click={() => downloadMuseTreeAudio($selectedSectionsStore, name)}>MuseTree (.wav)</Button>

    <span>Request the audio from MuseNet - as it would sound in the official MuseNet tool. Less synth-y than the MuseTree export, but it can take a minute to respond</span>
    <div style="display: flex; flex-direction: column">
        <Button on:click={() => downloadMuseNetAudio($selectedEncodingStore, "wav", name)}>MuseNet (.wav)</Button>
        <Button on:click={() => downloadMuseNetAudio($selectedEncodingStore, "mp3", name)}>MuseNet (.mp3)</Button>
        <Button on:click={() => downloadMuseNetAudio($selectedEncodingStore, "mp3", name)}>MuseNet (.ogg)</Button>
    </div>

    <span>Midi file for editing in other software:</span>
    <Button on:click={() => downloadMidiAudio($selectedEncodingStore, name)}>Midi</Button>

    <span>Text file containing the encoding as seen in the box above:</span>
    <Button on:click={() => download($selectedEncodingStore, name + ".txt")}>Encoding</Button>

    <span>Log info about the current track to the browser console for debugging</span>
    <Button on:click={() => console.log(JSON.stringify($selectedBranchStore.section.notes))}>
        Log
    </Button>
</div>
