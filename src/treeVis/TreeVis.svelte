<script>
  import {onMount, afterUpdate} from "svelte";
  import {autoPlayStore, preplayStore, configStore} from "../state/settings";
  import {audio} from "../state/audio";
  import {request} from "../broker";
  import TreeVisRow from "./TreeVisRow.svelte";
  import {root} from "../state/trackTree";
  import panzoom from "panzoom";

  // const linkGenerator = d3.linkVertical();

  // let root;
  // let links;
  // $: tree($d3TreeStore);
  //
  // function tree(data) {
  //   const hierarchy = d3.hierarchy(data);
  //   hierarchy.dx = dx;
  //   hierarchy.dy = dy;
  //
  //   root = d3.tree().nodeSize([dx, dy])(hierarchy);
  //   links = root.links().map(link => ({
  //     d: linkGenerator({
  //       source: [link.source.x, link.source.y],
  //       target: [link.target.x, link.target.y]
  //     }),
  //     color: linkColor(link.source, link.target),
  //     key:
  //       JSON.stringify(link.source.data.path) +
  //       "," +
  //       JSON.stringify(link.target.data.path)
  //   }));
  // }

  // let transform;

  // function applyTransform() {
  //   if (transform == null) return;
  //   d3.select("#tree").attr("transform", transform);
  // }
  //
  // onMount(() => {
  //   d3.select("svg").call(
  //           d3.zoom().on("zoom", function () {
  //             transform = d3.event.transform;
  //             applyTransform();
  //           })
  //   );
  // });
  //
  // afterUpdate(applyTransform);
  //
  // function linkColor({data: source}, {data: target}) {
  //   if (source.isSelected && target.isSelected) {
  //     return "#f00";
  //   }
  //   if (target.wasSelected) {
  //     return "#f90";
  //   }
  //   return "#fff";
  // }

  let container;

  afterUpdate(() => {
    panzoom(container);
  })
</script>

<style>
  .tree-container {
    border-left: 1px solid white;
    height: 100%;
    width: 100%;
    flex-shrink: 0;
    background-color: black;
    overflow: hidden;
  }

  .pan-container {
    height: 100%;
  }

  .tree-position {
    position: absolute;
    left: 50%;
    right: 50%;
    top: 50%;
    bottom: 50%;
  }
</style>

{#if root != null}
  <div class="tree-container">
    <div class="pan-container" bind:this={container}>
      <div class="tree-position">
        <TreeVisRow parentStore={root} center={true}/>
      </div>
    </div>
  </div>
{/if}
