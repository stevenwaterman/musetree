<script lang="ts">
  import colorLookup from "../colors";
  import toCss from "react-style-object-to-css"

  export let disabled: boolean | undefined = undefined;
  export let emphasise: boolean | undefined = undefined;
  export let style: JSX.CSSProperties | undefined = undefined; 

  let textColor: string;
  $: textColor = disabled
    ? colorLookup.buttonBg
    : emphasise
    ? colorLookup.textEmphasis
    : colorLookup.textDark;

  let bgColor: string;
  $: bgColor = disabled
    ? colorLookup.buttonBgDisabled
    : emphasise
    ? colorLookup.text
    : colorLookup.buttonBg;

  let actualStyle: JSX.CSSProperties;
  $: actualStyle = { color: textColor, backgroundColor: bgColor, ...(style || {})};
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
  <div class="button disabled" style={toCss(actualStyle)}>
    <slot />
  </div>
{:else}
  <div class="button enabled" on:click style={toCss(actualStyle)}>
    <slot />
  </div>
{/if}
