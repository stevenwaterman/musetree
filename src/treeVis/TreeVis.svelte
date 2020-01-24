<script>
  import * as d3 from "d3";
  import {
    d3TreeStore,
    trackTreeStore,
    selectedPathStore
  } from "../track/trackTree.js";
  import { onMount } from "svelte";
  import { autoPlayStore, preplayStore } from "../settings.js";
  import { audio } from "../track/audio.js";

  const width = 500;
  const height = 500;
  const dx = 25;
  const dy = 50;
  const linkGenerator = d3.linkVertical();

  let root;
  let links;
  let xMin;
  let xMax;
  $: tree($d3TreeStore);

  function tree(data) {
    xMin = Infinity;
    xMax = -Infinity;

    const hierarchy = d3.hierarchy(data);
    hierarchy.dx = dx;
    hierarchy.dy = dy;

    root = d3.tree().nodeSize([dx, dy])(hierarchy);
    root.each(d => {
      xMin = Math.min(xMin, d.x);
      xMax = Math.max(xMax, d.x);
    });

    links = root.links().map(link => ({
      d: linkGenerator({
        source: [link.source.x, link.source.y],
        target: [link.target.x, link.target.y]
      }),
      color: linkColor(link.source, link.target)
    }));
  }

  onMount(() => {
    const tree = d3.select("#tree");
    d3.select("svg").call(
      d3.zoom().on("zoom", function() {
        tree.attr("transform", d3.event.transform);
      })
    );
  });

  function linkColor({ data: source }, { data: target }) {
    if (source.isSelected && target.isSelected) {
      return "#f00";
    }
    if (target.wasSelected) {
      return "#f90";
    }
    return "#555";
  }

  function nodeColor({ wasSelected, isSelected }) {
    if (isSelected) {
      return "#f00";
    }
    if (wasSelected) {
      return "#f90";
    }
    return "#fff";
  }

  function select(path, startsAt) {
    trackTreeStore.selectFullPath(path, true);
    const playFrom = Math.max(0, startsAt - $preplayStore);
    if ($autoPlayStore) {
      audio.play(playFrom);
    }
  }

  function remove(path, idx) {
    trackTreeStore.deleteChild(path.slice(0, -1), idx);
  }
</script>

<style>
  svg {
    border: 1px solid black;
    height: 100%;
    width: 100%;
    flex-shrink: 0;
  }
  .label {
    pointer-events: none;
  }
  circle {
    cursor: pointer;
  }
</style>

{#if root != null}
  <svg viewBox="0, 0, 500, 500">
    <g
      id="tree"
      transform={`translate(${dx - xMin},${dy / 3})`}
      font-family="sans-serif"
      font-size="10">
      <g fill="none" stroke-opacity="0.4" stroke-width="1.5">
        {#each links as link}
          <path d={link.d} stroke={link.color} />
        {/each}
      </g>
      <g class="node">
        {#each root.descendants() as d}
          <g
            transform={`translate(${d.x},${d.y})`}
            on:mousedown={e => {
              if (e.button === 0) {
                select(d.data.path, d.data.startsAt);
              }
            }}
            on:contextmenu|preventDefault={remove(d.data.path, d.data.name)}>
            <circle stroke="black" fill={nodeColor(d.data)} r="10" />
            <text class="label" dy="0.31em" text-anchor="middle">
              {d.data.name}
            </text>
            {#if d.data.pendingLoad}
              <text class="label" dy="2.31em" text-anchor="middle">
                +{parseInt(d.data.pendingLoad) * 4}
              </text>
            {/if}
          </g>
        {/each}
      </g>
    </g>
  </svg>
{/if}
