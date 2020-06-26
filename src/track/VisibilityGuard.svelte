<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  export let root: Element | undefined;

  let element: Element | undefined;
  let observer: IntersectionObserver | undefined;

  let loaded: boolean = false;
  let observing: boolean = false;

  onMount(() => {
    if (element) {
      observer = new IntersectionObserver(
        (entries) => {
          loaded = loaded || entries.some((entry) => entry.isIntersecting);
          if (loaded) stopObserving();
        },
        {
          rootMargin: "100px",
          root: root,
          threshold: 0,
        }
      );
      observer.observe(element);
      observing = true;
    }
  });

  onDestroy(() => {
    if (observing) stopObserving();
  });

  function stopObserving() {
    if (observer && element) {
      observer.unobserve(element);
      observing = false;
    }
  }
</script>

<style>
  .guard {
    position: relative;
    height: 100%;
  }
</style>

<div bind:this={element} class="guard">
  <slot {loaded} />
</div>
