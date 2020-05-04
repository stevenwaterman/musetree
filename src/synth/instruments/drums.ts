import {InstrumentSynth} from "../nodes/InstrumentSynth";
import {AudioNote} from "../decoder";
import {NoteSynth} from "../nodes/NoteSynth";

const sampleNumbers = [
    3867, 3868, 3869, 3870, 3871, 3872, 3873, 3874, 3875, 3876, 3877, 3878,
    3879, 3880, 3881, 3882, 3883, 3884, 3885, 3886, 3887, 3888, 3889, 3890,
    3891, 3892, 3893, 3894, 3895, 3896, 3897, 3898, 3899, 3900, 3901, 3902,
    3903, 3904, 3905, 3906, 3907, 3908, 3909, 3910, 3911, 3912, 3913, 3914,
    3915, 3916, 3917, 3918, 3919, 3920, 3921, 3922, 3923, 3924, 3925, 3926, 3927];

export class Drums extends InstrumentSynth<"drums"> {
    protected instrument = "drums" as const;

    private readonly samples: Record<number, DrumSample>;

    constructor() {
        super();
        this.samples = {};
        sampleNumbers.forEach(number => {
            this.samples[number % 128] = new DrumSample(number);
        });
    }

    async setup(ctx: OfflineAudioContext) {
        const promises = Object.values(this.samples).map(sample => sample.setup(ctx));
        await Promise.all(promises);
    };

    async loadNote(note: AudioNote, ctx: BaseAudioContext, destination: AudioNode) {
        const pitch = note.pitch;
        const sample = this.samples[pitch];
        if (sample === undefined) {
            console.error("Unknown drum sample " + pitch);
            return;
        }
        await sample.loadNote(note, ctx, destination);
    };

}

class DrumSample implements NoteSynth {
    private static readonly OFFSET = 0;
    private readonly arrayBufferPromise: Promise<ArrayBuffer>;
    private audioBuffer: AudioBuffer = null as any;

    constructor(pitch: number) {
        this.arrayBufferPromise = fetch(`drums/${pitch}.mp3`)
            .then(response => response.arrayBuffer())
    }

    async setup(ctx: BaseAudioContext) {
        const arrayBuffer: ArrayBuffer = await this.arrayBufferPromise;
        this.audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
    }

    async loadNote(note: AudioNote, ctx: BaseAudioContext, destination: AudioNode) {
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(20, ctx.currentTime);
        gainNode.connect(destination);

        const bufferSource = ctx.createBufferSource();
        bufferSource.buffer = this.audioBuffer;
        bufferSource.connect(gainNode);
        bufferSource.start(ctx.currentTime + note.startTime - DrumSample.OFFSET);
    }
}