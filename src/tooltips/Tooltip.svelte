<script lang="ts">
  import colorLookup from "../colors";
  import toCss from "react-style-object-to-css"
  const textStyle: JSX.CSSProperties = {
    border: "1px solid",
    borderColor: colorLookup.border,
    backgroundColor: colorLookup.bgLight,
    color: colorLookup.textDark
  };

</script>

<style>
  .TT_text {
    visibility: hidden;
    padding: 5px;
    font-weight: 400;
    font-size: 12px;
    margin-left: 12px;
    pointer-events: none;

    position: absolute;
    z-index: 1;
  }

  .TT_trigger:hover .TT_text {
    visibility: visible;
  }
</style>

<div>
  <div class="TT_trigger">
    <slot name="trigger" />
    <div class="TT_text" style={toCss(textStyle)}>
      <slot />
    </div>
  </div>
</div>
