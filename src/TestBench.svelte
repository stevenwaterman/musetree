<script>
    import {Piano} from "./audio/instruments/piano";
    import {decode} from "./audio/decoder";

    let pitch = 60;
    let lengthInput = 5;
    $: length = 0.01 * Math.pow(2, lengthInput);

    async function play() {
        const ctx = new AudioContext();
        const synth = new Piano();
        await ctx.suspend();
        await synth.setup(ctx, ctx.destination);
        await synth.loadNote({
            volume: 0.5,
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

        const reverb = ctx.createConvolver();
        // reverb.buffer = impulseResponse(ctx, 10, 100);
        reverb.connect(gain);

        const mixer = ctx.createGain();
        mixer.gain.value = 1;
        mixer.connect(reverb);
        mixer.connect(gain);

        const synth = new Piano();
        await ctx.suspend();
        const encoding = "816 823 831 835 4095 4095 48 55 63 67 3969 816 823 831 840 4010 48 55 63 72 3978 816 823 833 839 4011 48 55 65 71 3978 816 823 831 840 4010 48 55 63 72 3978 816 823 827 842 4055 55 59 74 3988 825 828 835 4011 48 57 60 67 3978 823 827 830 835 4010 55 59 62 67 3978 816 828 831 836 4055 60 63 68 3989 824 828 831 4010 48 4011 56 60 63 3988 811 823 827 830 4095 3984 43 55 59 62 4035 816 823 831 835 4095 3984 48 55 63 67 4012 816 823 831 840 4011 48 55 63 72 3978 816 823 833 839 4010 48 55 65 71 3978 816 823 831 840 4011 48 55 63 72 3978 816 826 832 842 4010 58 64 3978 821 833 3999 74 3978 53 65 3978 825 831 840 4010 57 63 72 3978 821 831 833 3978 48 3999 53 63 65 3978 816 826 830 835 4010 58 62 3978 823 831 3999 48 67 3978 55 63 3978 809 821 831 837 4010 69 3978 1096 4000 41 53 63 3977 72 3978 814 821 958 968 4055 46 53 62 72 3989 819 823 835 838 4055 51 55 67 70 3988";
        let audioNotes = decode(encoding.split(" ").map(it => parseInt(it)));
        await synth.schedule(ctx, mixer, audioNotes);
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
