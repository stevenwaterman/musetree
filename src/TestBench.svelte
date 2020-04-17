<script>
    import {Piano} from "./synth/instruments/piano";
    import {decode} from "./synth/decoder";

    let pitch = 60;
    let lengthInput = 5;
    $: length = 0.01 * Math.pow(2, lengthInput);

    async function play() {
        const ctx = new AudioContext();
        const synth = new Piano();
        await ctx.suspend();
        await synth.setup(ctx, ctx.destination);
        await synth.loadNote({
            volume: 1,
            pitch: pitch,
            startTime: ctx.currentTime,
            endTime: ctx.currentTime + length
        }, ctx, ctx.destination);
        await ctx.resume();
    }
    
    async function playAll() {
        const ctx = new AudioContext();

        const gain = ctx.createGain();
        gain.gain.value = 0.1;
        gain.connect(ctx.destination);

        const synth = new Piano();
        await ctx.suspend();
        let audioNotes = decode([1072,1079,1084,3976,60,1096,3977,72,1099,3977,1098,75,3977,1096,74,3977,72,1099,3977,75,1103,3977,1101,79,3977,1099,77,3977,75,1103,3977,79,1106,3977,1104,82,3977,1103,80,3977,79,1106,3977,82,1108,3977,1106,84,3977,55,1084,1104,82,3977,80,1106,3977,82,1108,3977,84,1110,3977,86,1111,3977,1110,87,3977,1108,86,3977,84,1110,3977,48,1080,86,1111,3988,1108,87,3988,1104,84,3988,80,1108,3988,1079,56,1084,1103,84,3977,79,1108,3977,84,1111,3977,1110,87,3977,1108,86,3977,84,1111,3977,87,1115,3977,1113,91,3977,1111,89,3977,87,1115,3977,91,1118,3977,1116,94,3977,1115,92,3977,91,1118,3977,94,1120,3977,1118,96,3977,60,1087,1116,94,3977,92,1118,3977,94,1120,3977,96,1122,3977,98,1123,3977,1122,99,3977,1120,98,3977,96,1122,3977,98,1123,3988,1120,99,3988,1115,96,3988,91,1120,3988,1077,55,1084,63,1113,96,3977,89,1115,3977,91,1116,3977,92,1118,3977,94,1120,3977,1118,96,3977,1116,94,3977,92,1118,3977,1072,53,1080,60,94,1120,3988,1116,96,3988,1113,92,3988,89,1116,3988,48,1077,56,1084]);
        await synth.schedule(ctx, gain, audioNotes);
        await ctx.resume();
    }
</script>

<style>

</style>

<label>
    Pitch: {pitch}
    <input type="range" min=0 max=127 bind:value={pitch}>
</label>

<label>
    Time: {length}
    <input type="range" min=1 max=10 bind:value={lengthInput}>
</label>

<button on:click={play}>Play</button>
<button on:click={playAll}>Play All</button>
