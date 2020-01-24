<script>
  import { canvasWidth } from "../constants.js";
  import { selectedTrackStore } from "./trackTree.js";
  import { audioStatusStore } from "./audio.js";
  import { yScaleStore, autoScrollStore, isScrollingStore } from "../settings.js";
  import { create_in_transition } from "svelte/internal";

  function traverse(node, { startTime }) {
    const track = $selectedTrackStore;
    if (track == null) return;

    const endTime = track.endsAt;
    const transTime = endTime - startTime;

    const startPx = startTime * $yScaleStore;
    const endPx = endTime * $yScaleStore;
    const transPx = endPx - startPx;
    return {
      duration: transTime * 1000,
      tick: t => {
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
  let visible = false;

  audioStatusStore.subscribe(({ playing, time }) => {
    if (transition) transition.end();
    visible = playing;
    if (visible) {
      isScrollingStore.set($autoScrollStore);
      transition = create_in_transition(element, traverse, {
        startTime: time
      });
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
  }
</style>

<div
  bind:this={element}
  on:introend={() => {
    visible = false;
  }}
  class="anchor">
  <div hidden={!visible} class="line" />
</div>
