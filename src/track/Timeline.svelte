<script>
  import { canvasWidth, yScaleStore } from "../constants.js";
  import { selectedTrackStore } from "./trackTree.js";
  import {addAudioStatusListener} from "./audio.js";

  function traverse(node, { track, startTime }) {
    if (track == null) return;

    const endTime = track.duration;
    const transTime = endTime - startTime;
    
    const startPx = startTime * $yScaleStore;
    const endPx = endTime * $yScaleStore;
    const transPx = endPx - startPx;
    return {
      duration: transTime * 1000,
      css: t => {
        return `transform: translateY(${startPx + t * transPx}px);`;
      }
    };
  }

  let visible = -1;
  let startTime = 0;
  $: console.log(visible);
  addAudioStatusListener(state => {
      if(state.playing){
          visible = (visible + 1) % 2;
      } else {
          visible = -1;
      }
      startTime = state.startTime;
  });
</script>

<style>
  .line {
    position: absolute;
    height: 2px;
    background-color: rgba(255, 255, 255, 0.5);
    z-index: 2;
    transform: translateY(0px);
    pointer-events: none;
  }
</style>

{#if visible === 0}
  <div
    class={'line'}
    style={'width:' + canvasWidth + 'px'}
    in:traverse={{ track: $selectedTrackStore.track, startTime }}
    on:introend={() => {
      visible = -1;
    }}>
    </div>
{/if}
{#if visible === 1}
  <div
    class={'line'}
    style={'width:' + canvasWidth + 'px'}
    in:traverse={{ track: $selectedTrackStore.track, startTime }}
    on:introend={() => {
      visible = -1;
    }}>
    </div>
{/if}
