type ENVELOPE_A = {
    attack: number;
};

type ENVELOPE_H = {
    hold: number;
}

type ENVELOPE_D = {
    decay: number;
}

type ENVELOPE_S = {
    sustain: number;
}

type ENVELOPE_R = {
    release: number;
}

export type ENVELOPE_AHDSR = ENVELOPE_A & ENVELOPE_H & ENVELOPE_D & ENVELOPE_S & ENVELOPE_R;

export function ahdsr(ctx: BaseAudioContext, gain: number, startTime: number, endTime: number, envelope: ENVELOPE_AHDSR): GainNode {
    const node = ctx.createGain();
    node.gain.value = 0;

    let time = ctx.currentTime + startTime;
    node.gain.setValueAtTime(0, time);
    time += envelope.attack;
    node.gain.linearRampToValueAtTime(gain, time);
    time += envelope.hold;
    node.gain.linearRampToValueAtTime(gain, time);
    node.gain.setTargetAtTime(gain * envelope.sustain, time, envelope.decay);
    time = ctx.currentTime + endTime;
    node.gain.setTargetAtTime(0, time, envelope.release);

    return node;
}