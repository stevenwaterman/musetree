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

export function ahdsr(ctx: BaseAudioContext, gain: number, startTime: number, endTime: number, envelope: ENVELOPE_AHDSR, output: AudioNode): GainNode {
    const attackNode = ctx.createGain();
    attackNode.gain.value = 0;
    attackNode.connect(output);
    attackNode.gain.setValueAtTime(0, startTime);
    attackNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + startTime + envelope.attack);

    const decayNode = ctx.createGain();
    decayNode.gain.value = 1;
    decayNode.connect(attackNode);
    decayNode.gain.setTargetAtTime(envelope.sustain, ctx.currentTime + startTime + envelope.attack + envelope.hold, envelope.decay);

    const releaseNode = ctx.createGain();
    releaseNode.gain.value = 1;
    releaseNode.connect(decayNode);
    releaseNode.gain.setTargetAtTime(0, ctx.currentTime + endTime, envelope.release);

    return releaseNode;
}