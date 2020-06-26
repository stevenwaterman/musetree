<script lang="ts">
  import Button from "../buttons/Button.svelte";
  import { getContext } from "svelte";
  import ChangeLogModal from "./ChangeLogModal.svelte";
  import Changelog from "./Changelog";
  import colorLookup, { modalOptions } from "../colors";
  import HelpModal from "./HelpModal.svelte"
  import toCss from "react-style-object-to-css";

  const { open } = getContext("simple-modal");

  function openChangelog() {
    open(ChangeLogModal, {}, modalOptions);
  }

  function openHelp() {
    open(HelpModal, {}, modalOptions);
  }
</script>

<style>
  h1 {
    margin-top: 0;
  }

  .buttonRow {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }
</style>

<h1 style={toCss({ color: colorLookup.text })}>About</h1>
<p>
  MuseTree is a custom front-end for
  <a href="https://openai.com/blog/musenet/" target="_blank">
    OpenAi's MuseNet
  </a>
  , the AI music generator. The official app is a toy designed to show off the
  research. In contrast, MuseTree is designed for real music production, and has
  been built from the ground-up with that in mind.
</p>

<p>
  MuseTree is still in active development. I'm very happy to take suggestions,
  so please open a GitHub issue or comment on an existing one with your ideas!
  If you want to chat with me in real time, I
  <a href="https://twitch.tv/stevenwaterman" target="_blank">
    live-code on twitch.tv
  </a>
  Mon-Fri 2-6pm BST. At the minute, those streams are mostly my work on
  MuseTree, so come along and say hi!
</p>
<div class="buttonRow">
  <Button
    on:click={() => window.open('https://github.com/stevenwaterman/musetree')}>
    Source Code
  </Button>
  <Button on:click={() => window.open('http://www.stevenwaterman.uk')}>
    Steven Waterman
  </Button>
  <Button on:click={openChangelog}>
    Changelog - v{Changelog[0].version.join('.')}
  </Button>
  <Button on:click={openHelp}>Help</Button>
</div>
