<script>
    import {selectedSectionsStore, selectedEncodingStore} from "../state/trackTree";
    import {downloadMuseTreeAudio, downloadMuseNetAudio, downloadMidiAudio} from "./export";
    import colorLookup from "../colors";
    import download from "downloadjs";
    import Button from "../buttons/Button.svelte";
    import {encodingToString} from "../state/encoding";

    $: encoding = encodingToString($selectedEncodingStore);

    let name = "MuseTree_Export";
    let encodingArea;

    function copy() {
        encodingArea.select();
        document.execCommand("copy");
        encodingArea.setSelectionRange(0,0);
    }
</script>

<style>
    h1 {
        margin-top: 0;
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
        background-color: #00000055;
        color: white;
        border-radius: 24px;
        align-items: center;
        justify-content: center;
    }

    .copy_trigger:hover .copy {
        display: flex;
    }
</style>

<h1 style={ "color: " + colorLookup.text}>Export</h1>


<div style="display: flex; flex-direction: row; align-items: center; margin-bottom: 12px">
    <label for="exportName">
        File name:
    </label>
    <input id="exportName" bind:value={name} type="text" style={"margin-left: 12px; margin-bottom: 0; border: 1px dotted " + colorLookup.border + "; background-color: " + colorLookup.bgDark + "; color: " + colorLookup.textDark}/>
</div>

<label for="encoding" style="display: none">Encoding</label>
<div class="copy_trigger">
   <textarea bind:this={encodingArea} id="encoding" class="encoding" readonly style={"border: 1px dotted " + colorLookup.border + "; background-color: " + colorLookup.bgDark + "; color: " + colorLookup.textDark}>{encoding}</textarea>
    <div class="copy" on:click={copy}>Click to copy</div>
</div>



<Button on:click={() => download($selectedEncodingStore, name + ".txt")}>Encoding</Button>
<Button on:click={() => downloadMidiAudio($selectedEncodingStore, name)}>Midi</Button>
<Button on:click={() => downloadMuseTreeAudio($selectedSectionsStore, name)}>MuseTree (.wav)</Button>
<Button on:click={() => downloadMuseNetAudio($selectedEncodingStore, "wav", name)}>MuseNet (.wav)</Button>
<Button on:click={() => downloadMuseNetAudio($selectedEncodingStore, "mp3", name)}>MuseNet (.mp3)</Button>
<Button on:click={() => downloadMuseNetAudio($selectedEncodingStore, "mp3", name)}>MuseNet (.ogg)</Button>


