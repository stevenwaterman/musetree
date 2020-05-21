<script>
  import Button from "../buttons/Button.svelte";
  import {getContext} from "svelte";
  import ChangeLogModal from "./ChangeLogModal.svelte";
  import colorLookup, {modalOptions} from "../colors";

  const {open} = getContext("simple-modal");

  function openChangelog(){
    open(ChangeLogModal, {}, modalOptions);
  }
</script>

<style>
  .container {
    display: flex;
    flex-direction: column;
    padding: 12px;
  }
</style>

<div class="container" style={"color: " + colorLookup.textDark}>
  <h1>About</h1>
  <span>
    <a href="https://openai.com/blog/musenet/">
      Music generation using Musenet's API
    </a>
  </span>
  <span>
    <a href="https://github.com/stevenwaterman/musetree">
      Source code available on Github
    </a>
  </span>
  <span>
    <a href="http://www.stevenwaterman.uk">Developed by Steven Waterman</a>
  </span>
  <Button on:click={openChangelog}>Changelog</Button>
</div>
