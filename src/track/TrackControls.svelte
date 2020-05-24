<script>
    import {preplayStore, autoScrollStore, yScaleStore, autoPlayStore} from "../state/settings";
    import {play, stop, audioStatusStore} from "../audio/audioPlayer"
    import Button from "../buttons/Button.svelte";
    import colorLookup from "../colors";
</script>

<style>
    .container {
        flex-shrink: 0;
        padding-top: 4px;
    }

    button {
        margin: 4px;
    }

    .col {
        display: flex;
        flex-direction: column;
    }

    .row {
        display: flex;
        flex-direction: row;
    }

    .center {
        justify-content: center;
        text-align: center;
    }

    .margin {
        margin: 0 8px;
    }

    .slider {
        width: 100px;
    }
</style>

<div class="container row center" style={"color: " + colorLookup.textDark + "; border-top: 1px solid " + colorLookup.border + "; background-color: " + colorLookup.bgDark}>
    {#if $audioStatusStore.type === "on"}
        <Button on:click={stop}>Stop</Button>
    {:else if $audioStatusStore.type === "loading"}
        <Button disabled>Play</Button>
    {:else}
        <Button on:click={() => play(0)}>Play</Button>
    {/if}

    <div class="col margin">
        <label for="preplay">Pre-Play: {$preplayStore}s</label>
        <input class="slider" id="preplay" bind:value={$preplayStore} type="range" min="0" max="5" step="0.5"/>
    </div>

    <div class="col center margin">
        <label for="autoScroll">Auto Scroll</label>
        <input id="autoScroll" type="checkbox" bind:checked={$autoScrollStore}/>
    </div>

    <div class="col margin">
        <label for="yScale">Zoom: {$yScaleStore}%</label>
        <input class="slider" id="yScale" bind:value={$yScaleStore} type="range" min="10" max="500" step="10"/>
    </div>

    <div class="col center margin">
        <label for="autoPlay">Auto Play</label>
        <input id="autoPlay" type="checkbox" bind:checked={$autoPlayStore}/>
    </div>
</div>
