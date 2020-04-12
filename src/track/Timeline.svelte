<script>
  import { audioStatusStore } from "../synth/audio";
  import {
    yScaleStore,
    autoScrollStore,
    isScrollingStore
  } from "../state/settings";
  import { create_in_transition } from "svelte/internal";

  function traverse(node, {offset: startTime, trackDuration: endTime}) {
    const transTime = endTime - startTime;
    return {
      duration: transTime * 1000,
      tick: t => {
        const startPx = startTime * $yScaleStore;
        const endPx = endTime * $yScaleStore;
        const transPx = endPx - startPx;
        const y = startPx + t * transPx;
        node.style = `top:${y}px;`;
        if ($isScrollingStore) {
          node.scrollIntoView({
            block: "center",
            behaviour: "smooth"
          });
        }
      }
    };
  }

  let element;
  let transition;
  let hidden = true;

  audioStatusStore.subscribe(status => {
    if (transition) transition.end();
    hidden = status.type !== "playing";
    if (!hidden) {
      isScrollingStore.set($autoScrollStore);
      transition = create_in_transition(element, traverse, status);
      transition.start();
    }
  });
</script>

<style>
  .anchor {
    position: relative;
    top: 0;
    height: 0;
    width: 100%;
    z-index: 2;
    pointer-events: none;
  }

  .line {
    position: absolute;
    height: 2px;
    width: 100%;
    z-index: 2;
    background-color: rgba(255, 255, 255, 0.5);
    pointer-events: none;
    margin: 0 -1.5px;
  }
</style>

<div
        bind:this={element}
        on:introend="{() => { hidden = true; }}"
        class="anchor">
  <div class="line" hidden={hidden}></div>
</div>
