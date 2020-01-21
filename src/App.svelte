<script>
  import {
    selectedPathStore,
    selectedTrackAudioStore,
    selectedTrackStore
  } from "./trackTree.js";
  import TrackRow from "./TrackRow.svelte";

  $: paths = $selectedPathStore.map((element, idx, array) =>
    array.slice(0, idx + 1)
  );

</script>

<main>
  <TrackRow path={[]} />
  {#each paths as path}
    <TrackRow {path} />
  {/each}
</main>
