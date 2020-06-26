<script lang="ts">
  import { loadingProgressStore } from "../persistence/persistence";
  import type { LoadingProgressState } from "../persistence/persistence";
  import LoadingSpinner from "../persistence/LoadingSpinner.svelte";
  import { getContext } from "svelte";
  import colorLookup from "../colors";

  const { open, close } = getContext("simple-modal");

  loadingProgressStore.subscribe((state: LoadingProgressState) => {
    if (state) {
      open(
        LoadingSpinner,
        {},
        {
          closeButton: false,
          closeOnEsc: false,
          closeOnOuterClick: false,
          styleWindow: {
            background: "transparent",
            color: colorLookup.text,
          },
          styleContent: {
            overflow: "hidden",
          },
        }
      );
    } else {
      close();
    }
  });
</script>
