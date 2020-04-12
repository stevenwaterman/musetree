<script>
    import {preplayStore, autoScrollStore, yScaleStore, autoPlayStore} from "../state/settings";
    import {load as audioLoad, play, stop, audioStatusStore} from "../synth/audio"
</script>

<style>
    .container {
        background-color: black;
        border-top: 1px solid white;
        flex-shrink: 0;
        padding: 4px 0;
    }

    button {
        margin: 4px;
    }

    label {
        color: white;
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

<div class="container row center">
    {#if $audioStatusStore.type === "playing"}
        <button on:click={stop}>Stop</button>
    {:else if $audioStatusStore.type === "ready"}
        <button on:click={() => play(0)}>Play</button>
    {:else if $audioStatusStore.type === "loading"}
        <button>Loading</button>
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
