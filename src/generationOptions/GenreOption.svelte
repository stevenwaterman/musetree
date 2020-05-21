<script>
    import {genreStore} from "../state/settings";
    import {getContext} from "svelte";
    import Button from "../buttons/Button.svelte";

    export let text;
    export let genre;

    const emphasise = $genreStore[1] === genre;

    const {close} = getContext("simple-modal");

    function clicked() {
        genreStore.set([text, genre]);
        close()
    }
</script>

<Button emphasise={emphasise} on:click={clicked}>{text}</Button>
