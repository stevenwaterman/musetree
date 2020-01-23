<script>
  import * as d3 from "d3";
  import { d3TreeStore } from "../track/trackTree.js";
  import { onMount } from "svelte";

  const width = 500;
  const height = 500;
  const dx = 50;
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
      })
    }));
  }

  onMount(() => {
    let tree = d3.select("#tree");
    let svg = d3.select("svg").call(
      d3.zoom().on("zoom", function() {
        tree.attr("transform", d3.event.transform);
      })
    );
  });

  function nodeColor({wasSelected, isSelected, onSelectedPath}){
      if(onSelectedPath){
          return "#f00";
      }
      if(isSelected){
          return "#f90";
      }
      if(wasSelected){
          return "#ff0";
      }
      return "#fff";
  }
</script>

<style>
  svg {
    width: 500px;
    height: 500px;
    border: 1px solid black;
  }
</style>

{#if root != null}
  <svg viewBox="0, 0, 500, 500">
    <g
      id="tree"
      transform={`translate(${dx - xMin},${dy / 3})`}
      font-family="sans-serif"
      font-size="10">
      <g fill="none" stroke="#555" stroke-opacity="0.4" stroke-width="1.5">
        {#each links as link}
          <path d={link.d} />
        {/each}
      </g>
      <g class="node">
        {#each root.descendants() as d}
          {#if !d.data.isRoot}
            <g transform={`translate(${d.x},${d.y})`}>
              <circle stroke="black" fill={nodeColor(d.data)} r="10" />
              <text dy="0.31em" text-anchor="middle">{d.data.name}</text>
            </g>
          {/if}
        {/each}
      </g>
    </g>
  </svg>
{/if}
