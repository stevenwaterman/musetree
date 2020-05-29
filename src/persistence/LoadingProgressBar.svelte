<script>
    import colorLookup from "../colors";
    import {loadingProgressStore} from "./persistence";

    $: loadingState = $loadingProgressStore;
    $: done = loadingState === null ? null : loadingState.done;
    $: total = loadingState === null ? null : loadingState.total;
    $: percent = 100 * (done || 0) / (total || 1);
</script>

<style>
    .backdrop {
        position: relative;
        width: 200px;
        height: 40px;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .bar {
        border-radius: 4px;
        height: 100%;
        transition: width 0.2s ease-in-out;
    }

    .textContainer {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    span {
        text-align: center;
    }
</style>

<div class="backdrop"
     style={"background-color: " + colorLookup.loadingBarBG}>
    {#if loadingState}
        <div class="textContainer" style={"color: " + colorLookup.loadingBarText}>
            <span>
                {done.toLocaleString()} / {total.toLocaleString()}
            </span>
            <span>
               ({percent.toFixed(0)}%)
            </span>
        </div>
    {/if}
    <div class="bar" style={"background-color: " + colorLookup.loadingBarFG + "; width: " + percent + "%"}></div>
</div>
