<script lang="ts">
  import colorLookup from "../colors";

  export const disabled: boolean = false;
  export const emphasise: boolean = false;
  export const style: string = "";

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
    <div
      class="button disabled"
      style={style + '; color: ' + textColor + '; background-color: ' + bgColor}>
      <slot />
    </div>
  {:else}
    <div
      class="button enabled"
      on:click
      style={style + '; color: ' + textColor + '; background-color: ' + bgColor}>
      <slot />
    </div>
  {/if}
