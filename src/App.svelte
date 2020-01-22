<script>
  import Track from "./track/Track.svelte";
  import Options from "./Options.svelte";
  import {audio} from "./track/audio.js";

  
</script>



<main>
  <button on:click={() => audio.play(0)}>Play from Start</button>
  <Track/>
  <Options/>
</main>
