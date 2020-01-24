<script>
  import * as d3 from "d3";
  import {
    d3TreeStore,
    trackTreeStore,
    selectedPathStore
  } from "../track/trackTree.js";
  import { onMount, afterUpdate } from "svelte";
  import { autoPlayStore, preplayStore, configStore } from "../settings.js";
  import { audio } from "../track/audio.js";
  import { fade } from "svelte/transition";
  import { request } from "../broker.js";

  const width = 200;
  const height = 200;
  const dx = 25;
  const dy = 50;
  const linkGenerator = d3.linkVertical();

  let root;
  let links;
  $: tree($d3TreeStore);

  function tree(data) {
    const hierarchy = d3.hierarchy(data);
    hierarchy.dx = dx;
    hierarchy.dy = dy;

    root = d3.tree().nodeSize([dx, dy])(hierarchy);
    links = root.links().map(link => ({
      d: linkGenerator({
        source: [link.source.x, link.source.y],
        target: [link.target.x, link.target.y]
      }),
      color: linkColor(link.source, link.target),
      key:
        JSON.stringify(link.source.data.path) +
        "," +
        JSON.stringify(link.target.data.path)
    }));
  }

  let transform;
  function applyTransform() {
    if (transform == null) return;
    d3.select("#tree").attr("transform", transform);
  }

  onMount(() => {
    d3.select("svg").call(
      d3.zoom().on("zoom", function() {
        transform = d3.event.transform;
        applyTransform();
      })
    );
  });

  afterUpdate(applyTransform);

  function linkColor({ data: source }, { data: target }) {
    if (source.isSelected && target.isSelected) {
      return "#f00";
    }
    if (target.wasSelected) {
      return "#f90";
    }
    return "#fff";
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

  function select({ path, startsAt }) {
    trackTreeStore.selectFullPath(path, true);
    const playFrom = Math.max(0, startsAt - $preplayStore);
    if ($autoPlayStore) {
      audio.play(playFrom);
    }
  }

  function loadMore({ path, encoding, endsAt }) {
    const pathCapture = path;
    trackTreeStore.requestStart(path);

    return request($configStore, encoding, endsAt)
      .then(tracks => trackTreeStore.addTracks(pathCapture, tracks))
      .finally(_ => trackTreeStore.requestDone(pathCapture));
  }

  function remove(path, idx) {
    trackTreeStore.deleteChild(path.slice(0, -1), idx);
  }
</script>

<style>
  svg {
    border-left: 1px solid white;
    height: 100%;
    width: 100%;
    flex-shrink: 0;
    background-color: black;
  }
  .label {
    pointer-events: none;
  }
  circle {
    cursor: pointer;
  }
</style>

{#if root != null}
  <svg viewbox={`${-width / 2} -${height / 2} ${width} ${height}`}>
    <g id="tree" font-family="sans-serif" font-size="10">
      <g fill="none" stroke-opacity="0.4" stroke-width="1.5">
        {#each links as link (link.key)}
          <path d={link.d} stroke={link.color} transition:fade />
        {/each}
      </g>
      <g class="node">
        {#each root.descendants() as d (JSON.stringify(d.data.path))}
          <g
            transform={`translate(${d.x},${d.y})`}
            on:mousedown={e => {
              if (e.button === 0) {
                if (e.ctrlKey) {
                  loadMore(d.data);
                } else {
                  select(d.data);
                }
              }
            }}
            on:contextmenu|preventDefault={remove(d.data.path, d.data.name)}>
            <circle fill={nodeColor(d.data)} r="10" transition:fade />
            <text
              class="label"
              dy="0.31em"
              text-anchor="middle"
              transition:fade>
              {d.data.name}
            </text>
            {#if d.data.pendingLoad}
              <text
                class="label"
                dy="2.31em"
                text-anchor="middle"
                fill="white"
                transition:fade>
                +{parseInt(d.data.pendingLoad) * 4}
              </text>
            {/if}
          </g>
        {/each}
      </g>
    </g>
  </svg>
{/if}
