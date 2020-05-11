<script>
    export let disabled = false;
    export let style = "";
</script>

<style>
    .button {
        display: inline-block;
        padding: 0.35em 1.2em;
        border: 0.1em solid black;
        color: black;
        background-color: white;
        margin: 0 0.3em 0.3em 0;
        border-radius: 0.12em;
        box-sizing: border-box;
        text-align: center;
        transition: all 0.1s;
        cursor: pointer;
    }

    .button:hover {
        color: white;
        background-color: #555;
    }

    .button-disabled {
        display: inline-block;
        padding: 0.35em 1.2em;
        border: 0.1em solid #555;
        color: #555;
        background-color: #ccc;
        margin: 0 0.3em 0.3em 0;
        border-radius: 0.12em;
        box-sizing: border-box;
        text-align: center;
        cursor: default;
    }
</style>

{#if disabled}
    <div class="button-disabled" style={style}>
        <slot/>
    </div>
{:else}
    <div class="button" on:click on:contextMenu style={style}>
        <slot/>
    </div>
{/if}

