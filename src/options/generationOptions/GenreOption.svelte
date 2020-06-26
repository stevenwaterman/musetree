<script lang="ts">
  import type { Genre } from "../../constants";
  import { genreStore } from "../../state/settings";
  import { getContext } from "svelte";
  import Button from "../../buttons/Button.svelte";

  export let text: string;
  export let genre: Genre;

  const emphasise = $genreStore[1] === genre;

  const { close } = getContext("simple-modal");

  function clicked() {
    genreStore.set([text, genre]);
    close();
  }
</script>

<Button {emphasise} on:click={clicked}>{text}</Button>
