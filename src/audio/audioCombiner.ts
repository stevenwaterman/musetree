import {Section} from "../state/section";

export type AudioDatum = {
    buffer: AudioBuffer,
    start: number,
    end: number
};

const sampleRate = 44100;
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

export async function combineSections(sections: Section[]): Promise<{buffer: AudioBuffer, duration: number}> {
    const data: AudioDatum[] = sections
        .map(section => {
            return {
                start: section.startsAt,
                end: section.endsAt,
                buffer: section.audio
            };
        });
    const buffer = await combine(data);
    const duration = data[data.length - 1].end;
    return {buffer, duration};
}
