<script>
    import {genreStore} from "../state/settings";
    import {getContext} from "svelte";

    export let text;
    export let genre;

    const selected = $genreStore[1] === genre;

    const {close} = getContext("simple-modal");

    function clicked() {
        genreStore.set([text, genre]);
        close()
    }
</script>

<style>
    button {
        margin-bottom: 0;
    }

    .selected {
        background-color: black;
        color: white;
    }
</style>

<button class:selected on:click={clicked}>{text}</button>
