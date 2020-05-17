<script>
    import {genreStore} from "../state/settings";
    import {getContext} from "svelte";
    import Button from "../buttons/Button.svelte";

    export let text;
    export let genre;

    const selected = $genreStore[1] === genre;

    const {close} = getContext("simple-modal");

    function clicked() {
        genreStore.set([text, genre]);
        close()
    }
</script>

<Button inverted={selected} on:click={clicked}>{text}</Button>
