<script lang="ts">
  import { getContext } from "svelte";
  import { modalOptions } from "../colors";
  import { root } from "../state/trackTree";
  import { load } from "./persistence";
  import HelpModal from "../about/HelpModal.svelte";
  import { onMount } from "svelte";

  const { open } = getContext("simple-modal");

  onMount(() => {
    const autoLoad: string | null = localStorage.getItem("autosave");
    if (autoLoad === null) {
      open(HelpModal, {}, modalOptions);
    } else {
      load(root, autoLoad);
    }
  });
</script>
