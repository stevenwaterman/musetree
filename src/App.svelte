<script>
  import Track from "./Track.svelte";
  import {audio} from "./audio.js";

  
</script>



<main>
  <button on:click={() => audio.play(0)}>Play from Start</button>
  <Track/> 
</main>
