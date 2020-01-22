<script>
  import { canvasWidth } from "../constants.js";
  import { selectedTrackStore } from "./trackTree.js";
  import { audioStatusStore } from "./audio.js";
  import { yScaleStore, autoScrollStore } from "../settings.js";
  import { create_in_transition } from "svelte/internal";

  function traverse(node, { startTime }) {
    const track = $selectedTrackStore.track;
    if (track == null) return;

    const endTime = track.duration;
    const transTime = endTime - startTime;

    const startPx = startTime * $yScaleStore;
    const endPx = endTime * $yScaleStore;
    const transPx = endPx - startPx;
    return {
      duration: transTime * 1000,
      tick: t => {
        const y = startPx + t * transPx;
        node.style = `top:${y}px;`;
        if ($autoScrollStore) {
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
      transition = create_in_transition(element, traverse, {
        startTime: time
      });
      transition.start();
    }
  });
</script>

<style>
  .line {
    position: relative;
    height: 2px;
    background-color: rgba(255, 255, 255, 0.5);
    z-index: 2;
    top: 0px;
    pointer-events: none;
    width: 100%;
  }
</style>

<div
  bind:this={element}
  hidden={!visible}
  class={'line'}
  on:introend={() => {
    visible = false;
  }} />
