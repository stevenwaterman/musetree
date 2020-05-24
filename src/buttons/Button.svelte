<script>
    import colorLookup from "../colors";

    export let disabled = false;
    export let emphasise = false;
    export let style = "";

    $: textColor = disabled ? colorLookup.buttonBg : emphasise ? colorLookup.textEmphasis : colorLookup.textDark;
    $: bgColor = disabled ? colorLookup.buttonBgDisabled : emphasise ? colorLookup.text : colorLookup.buttonBg;

    $: emphClazz = emphasise ? "emphasise" : ""
</script>

<style>
    .button {
        display: inline-block;
        padding: 0.35em 1.2em;
        margin: 0.3em;
        border-radius: 0.12em;
        box-sizing: border-box;
        text-align: center;
        transition: all 0.1s;
        cursor: pointer;
    }

    .enabled:hover {
        background-color: #314549;
        color: #c3cee3;
    }

    .enabled {
        cursor: pointer;
    }

    .disabled {
        cursor: default;
    }
</style>

{#if disabled}
    <div class="button disabled" style={style + "; color: " + textColor + "; background-color: " + bgColor}>
        <slot/>
    </div>
{:else}
    <div class="button enabled" on:click on:contextMenu style={style + "; color: " + textColor + "; background-color: " + bgColor}>
        <slot/>
    </div>
{/if}
