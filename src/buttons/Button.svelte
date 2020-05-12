<script>
    export let disabled = false;
    export let inverted = false;
    export let style = "";

    $: clazz = inverted ? "button-inverted" : "button-normal";
</script>

<style>
    .button {
        display: inline-block;
        padding: 0.35em 1.2em;
        margin: 0 0.3em 0.3em 0;
        border-radius: 0.12em;
        box-sizing: border-box;
        text-align: center;
        transition: all 0.1s;
        cursor: pointer;
    }

    .button-normal {
        border: 0.1em solid black;
        color: black;
        background-color: white;
    }

    .button-normal:hover {
        color: white;
        background-color: #555;
    }

    .button-inverted {
        border: 0.1em solid white;
        color: white;
        background-color: black;
    }

    .button-inverted:hover {
        color: black;
        background-color: #aaa;
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
    <div class={"button " + clazz} on:click on:contextMenu style={style}>
        <slot/>
    </div>
{/if}

