<script>
    import colorLookup from "../colors";
    const tt_text_style = "border: 1px solid " + colorLookup.border + "; background-color: " + colorLookup.bgLight + "; color: " + colorLookup.textDark;
</script>

<style>
    .TT_trigger {
    }

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
        <slot name="trigger"/>
        <div class="TT_text" style={tt_text_style}>
            <slot name="content"/>
        </div>
    </div>
</div>

