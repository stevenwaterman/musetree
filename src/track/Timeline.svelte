<script lang="ts">
  import { audioStatusStore } from "../audio/audioPlayer";
  import type { AudioStatus_On } from "../audio/audioPlayer";
  import {
    yScaleStore,
    autoScrollStore,
    isScrollingStore,
  } from "../state/settings";
  import { create_in_transition } from "svelte/internal";

  function traverse(
    node: Element,
    { offset: startTime, duration: endTime }: AudioStatus_On
  ) {
    const transTime: number = endTime - startTime;
    const style = ((node as unknown) as ElementCSSInlineStyle).style;
    return {
      duration: transTime * 1000,
      tick: (t: number) => {
        const startPx: number = startTime * $yScaleStore;
        const endPx: number = endTime * $yScaleStore;
        const transPx: number = endPx - startPx;
        const y: number = startPx + t * transPx;
        style.top = `${y}px`;
        if ($isScrollingStore) {
          node.scrollIntoView({
            block: "center",
          });
        }
      },
    };
  }

  let element: HTMLDivElement | undefined;
  let transition: {
    start: () => void;
    invalidate: () => void;
    end: () => void;
  };
  let hidden: boolean = true;

  audioStatusStore.subscribe((status) => {
    if (transition) transition.end();
    hidden = status.type !== "on";
    if (!hidden && element) {
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
  on:introend={() => {
    hidden = true;
  }}
  class="anchor">
  <div class="line" {hidden} />
</div>
