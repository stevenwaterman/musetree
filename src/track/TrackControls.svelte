<script>
    import {preplayStore, autoScrollStore, splitStore, yScaleStore, autoPlayStore} from "../state/settings";
    import {play, stop, audioStatusStore} from "../audio/audioPlayer"
    import Button from "../buttons/Button.svelte";
    import colorLookup from "../colors";
    import AboutModalButton from "../about/AboutModalButton.svelte";
    import FileInput from "../buttons/FileInput.svelte";
    import {root} from "../state/trackTree";
    import {save, load} from "../persistence/persistence";
    import {undoStore} from "../state/undo";

    const reader = new FileReader();
    reader.onload = async event => {
        await load(root, event.target.result);
    };

    function loadClicked(file) {
        reader.readAsText(file);
    }

    $: disallowSave = Object.keys($root.children).length === 0;

    const tt_text_style = "border: 1px solid " + colorLookup.border + "; background-color: " + colorLookup.bgLight;
</script>

<style>
    .container {
        height: 100%;
        display: flex;
        flex-direction: row;
    }

    button {
        margin: 4px;
    }

    .col {
        display: flex;
        flex-direction: column;
    }

    .center {
        justify-content: center;
        text-align: center;
        align-items: center;
    }

    .margin {
        margin: 0 8px;
    }

    .slider {
        width: 100px;
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

    .playStop {
        width: 25px;
        font-size: 24pt;
        cursor: pointer;
        margin-right: 12px;
        margin-top: -5px;
    }
</style>

<div class="container center" style={"color: " + colorLookup.textDark + "; border-top: 1px solid " + colorLookup.border + "; background-color: " + colorLookup.bgDark}>
    {#if $audioStatusStore.type === "on"}
        <div class="playStop" on:click={stop} style={`color: ${colorLookup.text}`}>■</div>
    {:else if $audioStatusStore.type === "loading"}
        <div class="playStop" style={`color: ${colorLookup.text}; cursor: default`}>▶</div>
    {:else}
        <div class="playStop" on:click={() => play(0)} style={`color: ${colorLookup.text}`}>▶</div>
    {/if}

    <div class="col center margin">
        <label for="autoScroll" class="TT_trigger">
            Auto Scroll
            <span class="TT_text" style={tt_text_style}>
                Scroll the track to show the part that is playing
            </span>
        </label>
        <input id="autoScroll" type="checkbox" bind:checked={$autoScrollStore}/>
    </div>

    <div class="col margin">
        <label for="yScale">Zoom: {$yScaleStore}%</label>
        <input class="slider" id="yScale" bind:value={$yScaleStore} type="range" min="10" max="500" step="10"/>
    </div>

    <div class="col margin">
        <label for="split">Split: {$splitStore}%</label>
        <input class="slider" id="split" bind:value={$splitStore} type="range" min="0" max="100" step="5"/>
    </div>

    <div class="col center margin">
        <label for="autoPlay" class="TT_trigger">
            Auto Play
            <span class="TT_text" style={tt_text_style}>
                Start playing the audio when a new node is selected
            </span>
        </label>
        <input id="autoPlay" type="checkbox" bind:checked={$autoPlayStore}/>
    </div>

    <div class="col margin">
        <label for="preplay" class="TT_trigger">
            Pre-Play: {$preplayStore}s
            <span class="TT_text" style={tt_text_style}>
                When a section auto-plays, how many seconds of the previous section should we play first?
            </span>
        </label>
        <input class="slider" id="preplay" bind:value={$preplayStore} type="range" min="0" max="5" step="0.5"/>
    </div>

    <Button disabled={$undoStore.length === 0} on:click={undoStore.undo}>Undo (z)</Button>

    <FileInput fileTypes=".mst" handleFile={loadClicked}> Load</FileInput>
    <Button disabled={disallowSave} on:click={() => save(root)}> Save</Button>

    <AboutModalButton/>
</div>
