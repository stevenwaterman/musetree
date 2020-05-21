<script>
    import changelog from "./Changelog";

    //TODO add link to github repo at commit hash
</script>

<style>
    h1 {
        margin-top: 0;
    }
</style>

<div>
    <h1>ChangeLog</h1>

    {#each changelog as entry}
        <h2>v{entry.version[0]}.{entry.version[1]}.{entry.version[2]} - {entry.date.toLocaleDateString()}</h2>
        <ul>
            {#each entry.changes as change}
                <li>{change}</li>
            {/each}
        </ul>
    {/each}
</div>