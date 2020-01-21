<script>
  import { canvasWidth } from "./constants.js";
  import { yScaleStore } from "./constants.js";
  import { selectedTrackStore } from "./trackTree.js";
  import {addAudioStatusListener} from "./audio.js";

  function traverse(node, { track, startTime, yScale }) {
    if (track == null) return;

    const startPx = startTime * yScale;
    const endTime = track.duration;
    const endPx = endTime * yScale;
    const transTime = endTime - startTime;
    const transPx = endPx - startPx;
    return {
      duration: transTime * 1000,
      css: t => {
        return `transform: translateY(${startPx + t * transPx}px);`;
      }
    };
  }

  let visible = 0;
  let startTime = 0;
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
    height: 5px;
    background-color: #0005;
    z-index: 2;
    transform: translateY(0px);
  }
</style>

{#if visible === 0}
  <div
    class={'line'}
    style={'width:' + canvasWidth + 'px'}
    in:traverse={{ track: $selectedTrackStore.track, startTime, yScale: $yScaleStore }}
    on:introend={() => {
      visible = -1;
    }}>
    </div>
{/if}
{#if visible === 1}
  <div
    class={'line'}
    style={'width:' + canvasWidth + 'px'}
    in:traverse={{ track: $selectedTrackStore.track, startTime, yScale: $yScaleStore }}
    on:introend={() => {
      visible = -1;
    }}>
    </div>
{/if}
