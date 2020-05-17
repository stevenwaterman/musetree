<script>
    export let disabled = false;
    export let fileTypes = "";
    export let handleFile = () => {
    };
</script>

<style>
    .button {
        display: inline-block;
        padding: 0.35em 1.2em;
        border: 0.1em solid black;
        color: black;
        background-color: white;
        margin: 0 0.3em 0.3em 0;
        border-radius: 0.12em;
        box-sizing: border-box;
        text-align: center;
        transition: all 0.1s;
        cursor: pointer;
    }

    .button:hover {
        color: white;
        background-color: #555;
    }

    .button-disabled {
        display: inline-block;
        padding: 0.35em 1.2em;
        border: 0.1em solid #555;
        color: #555;
        background-color: #ccc;
        margin: 0 0.3em 0.3em 0;
        border-radius: 0.12em;
        box-sizing: border-box;
        text-align: center;
        cursor: default;
    }

    .hidden {
        display: none;
    }
</style>

{#if disabled}
    <label for="upload" class="button-disabled">
        <slot/>
    </label>
{:else}
    <div on:dragover|preventDefault|stopPropagation on:drop|preventDefault|stopPropagation={event => handleFile(event.dataTransfer.files.item(0))}>
        <label for="upload" class="button">
            <slot/>
            <input
                    id="upload"
                    class="hidden"
                    type="file"
                    accept={fileTypes}
                    multiple={false}
                    on:change|preventDefault|stopPropagation={event => handleFile(event.target.files[0])}
            />
        </label>
    </div>
{/if}

