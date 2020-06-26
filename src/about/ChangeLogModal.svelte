<script lang="ts">
  import changelog from "./Changelog";
</script>

<style>
  h1 {
    margin-top: 0;
  }
</style>

<div>
  <h1>ChangeLog</h1>

  {#each changelog as entry}
    <a
      href={'https://github.com/stevenwaterman/musetree/tree/' + entry.commitHash}
      target="_blank">
      <h2>
        v{entry.version[0]}.{entry.version[1]}.{entry.version[2]} - {entry.date.toLocaleDateString()}
      </h2>
    </a>

    <ul>
      {#each entry.changes as change}
        <li>{change}</li>
      {/each}
    </ul>
  {/each}
</div>
