import {InstrumentSynth} from "../nodes/InstrumentSynth";
import {NoteSynth} from "../nodes/NoteSynth";
import {Note} from "../../state/notes";

export class Drums extends InstrumentSynth<"drums"> {
    private static ENCODINGS: number[] = [
        3867, 3868, 3869, 3870, 3871, 3872, 3873, 3874, 3875, 3876, 3877, 3878,
        3879, 3880, 3881, 3882, 3883, 3884, 3885, 3886, 3887, 3888, 3889, 3890,
        3891, 3892, 3893, 3894, 3895, 3896, 3897, 3898, 3899, 3900, 3901, 3902,
        3903, 3904, 3905, 3906, 3907, 3908, 3909, 3910, 3911, 3912, 3913, 3914,
        3915, 3916, 3917, 3918, 3919, 3920, 3921, 3922, 3923, 3924, 3925, 3926, 3927];
    private static DURATIONS: number[] = [
        0.2612244897959184,
        0.2873469387755102,
        0.23510204081632652,
        0.2612244897959184,
        0.23510204081632652,
        0.0783673469387755,
        0.0783673469387755,
        1.253877551020408,
        0.2873469387755102,
        0.2612244897959184,
        0.23510204081632652,
        0.23510204081632652,
        0.313469387755102,
        0.313469387755102,
        0.6791836734693878,
        0.1306122448979592,
        0.6008163265306122,
        0.1306122448979592,
        0.6008163265306122,
        0.2612244897959184,
        0.5485714285714286,
        0.47020408163265304,
        2.246530612244898,
        0.3657142857142857,
        1.2016326530612245,
        1.123265306122449,
        1.123265306122449,
        0.4179591836734694,
        0.7836734693877551,
        0.23510204081632652,
        1.906938775510204,
        0.6791836734693878,
        1.28,
        0.156734693877551,
        0.23510204081632652,
        0.156734693877551,
        0.2873469387755102,
        0.3395918367346939,
        0.313469387755102,
        0.39183673469387753,
        0.156734693877551,
        0.18285714285714286,
        0.1306122448979592,
        0.156734693877551,
        0.313469387755102,
        0.6008163265306122,
        0.1306122448979592,
        0.3657142857142857,
        0.1306122448979592,
        0.2089795918367347,
        0.2612244897959184,
        0.3395918367346939,
        0.3657142857142857,
        0.18285714285714286,
        0.2612244897959184,
        0.1306122448979592,
        0.4963265306122449,
        2.6383673469387756,
        0.10448979591836735,
        0.23510204081632652,
        0.9404081632653061
    ]
    private static ENCODING_OFFSET: number = 3840;

    protected instrument = "drums" as const;

    private readonly samples: Record<number, DrumSample>;

    constructor() {
        super();
        this.samples = {};
        Drums.ENCODINGS.forEach(number => {
            this.samples[number - Drums.ENCODING_OFFSET] = new DrumSample(number);
        });
    }

    async setup(ctx: OfflineAudioContext) {
        const promises = Object.values(this.samples).map(sample => sample.setup(ctx));
        await Promise.all(promises);
    };

    async loadNote(note: Note, ctx: BaseAudioContext, destination: AudioNode) {
        if(note.type === "COMPLETE") {
            const pitch = note.pitch;
            const sample = this.samples[pitch];
            if (sample === undefined) {
                console.error("Unknown drum sample " + pitch);
                return;
            }
            await sample.loadNote(note, ctx, destination);
        }
    };

    durationOf(token: number): number {
        const idx = Drums.ENCODINGS.indexOf(token);
        return Drums.DURATIONS[idx];
    }
}

class DrumSample implements NoteSynth {
    private static readonly OFFSET = 0.051;
    private readonly arrayBufferPromise: Promise<ArrayBuffer>;
    private audioBuffer: AudioBuffer = null as any;
    private pitch: number;
    constructor(pitch: number) {
        this.pitch = pitch;
        this.arrayBufferPromise = fetch(`drums/${pitch}.mp3`)
            .then(response => response.arrayBuffer())
    }

    async setup(ctx: BaseAudioContext) {
        const arrayBuffer: ArrayBuffer = await this.arrayBufferPromise;
        this.audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
    }

    async loadNote(note: Note, ctx: BaseAudioContext, destination: AudioNode) {
        const gain = ctx.createGain();
        gain.gain.value = 0.25;
        gain.connect(destination);

        const bufferSource = ctx.createBufferSource();
        bufferSource.buffer = this.audioBuffer;
        bufferSource.connect(gain);
        bufferSource.start(note.startTime, DrumSample.OFFSET);
    }
}