<script lang="ts">
  import colorLookup from "../colors";
  import toCss from "react-style-object-to-css"
  const textColorStyle = { color: colorLookup.text };
</script>

<style>
  h1 {
    margin-top: 0;
  }

  .subheading {
    font-size: 10pt;
    text-align: center;
  }
</style>

<h1 style={toCss(textColorStyle)}>MuseTree Help</h1>

<p class="subheading">
  <i>
    You can open this window at any time by clicking
    <b>About</b>
    , then clicking
    <b>Help</b>
  </i>
</p>

<h2 style={toCss(textColorStyle)}>What is MuseTree?</h2>
<p>
  MuseTree lets you work with an AI to generate music in range of styles. It is
  designed for non-musicians interested in creating music, and small content
  creators e.g. YouTubers.
</p>

<h2 style={toCss(textColorStyle)}>Getting Started</h2>
<p>
  In the
  <b>Tree View</b>
  , right-click the red
  <b>Root</b>
  node and select
  <b>Request More</b>
  . This asks the AI to generate some music. It can take up to a minute, so be
  patient.
</p>
<p>
  When you see the four children under the root node, try clicking one to select
  it. The
  <b>Track View</b>
  will display the notes and you will the audio begin to play. Pick your
  favourite child, and ask the AI to generate a follow-up section, then delete
  the others.
</p>
<p>
  You can control the AI using the
  <b>Generation Options</b>
  on the right-hand side of the screen. Each option has a tooltip explaining
  what that setting does.
</p>
<p>
  When you are happy with your track, right-click the bottom node and choose
  <b>Save Audio</b>
  .
</p>

<h2 style={toCss(textColorStyle)}>Advanced Tips</h2>
<p>
  After right-clicking a node, each option in the context menu has one letter
  underlined. Rather than clicking the button, you can just press the underline
  key on your keyboard. This works even if the menu is not open, as long as you
  are hovering over that node. Other hotkeys are
  <b>space</b>
  for play/pause and
  <b>z</b>
  for undo.
</p>
<p>
  If all four children of a node are identical, be careful. MuseNet may have
  started overfitting, and could be generating a real song. Try increasing the
  <b>Temperature</b>
  before asking the AI to try again.
</p>
<p>
  There is a
  <b>Delete All</b>
  option if you right-click the root node.
</p>
<p>
  You can change the instruments or other settings mid-way through a track and
  MuseNet will try to seamlessly transition to the new settings.
</p>
