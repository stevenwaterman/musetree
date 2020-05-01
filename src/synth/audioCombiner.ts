export type AudioDatum = {
    buffer: AudioBuffer,
    start: number,
    end: number
};

const sampleRate = 48000;
export async function combine(data: AudioDatum[]): Promise<AudioBuffer> {
    const duration = Math.max(...data.map(it => it.end));
    const ctx = new OfflineAudioContext(1, duration * sampleRate, sampleRate);

    data.forEach(({buffer, start}) => {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(start)
    })

    return await ctx.startRendering();
}
