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
export type ENVELOPE_AHD = ENVELOPE_A & ENVELOPE_H & ENVELOPE_D;

export class AhdsrEnvelope {
  private readonly ctx: BaseAudioContext;

  private readonly gain: number;
  private readonly envelope: ENVELOPE_AHDSR;

  private readonly attackNode: GainNode;
  private readonly decayNode: GainNode;
  private readonly releaseNode: GainNode;

  readonly input: AudioNode;

  constructor(ctx: BaseAudioContext, gain: number, envelope: ENVELOPE_AHDSR) {
    this.ctx = ctx;
    this.gain = gain;
    this.envelope = envelope;

    this.attackNode = ctx.createGain();
    this.decayNode = ctx.createGain();
    this.releaseNode = ctx.createGain();

    this.attackNode.gain.value = 0;
    this.decayNode.gain.value = 1;
    this.releaseNode.gain.value = 1;

    this.attackNode.connect(this.decayNode);
    this.decayNode.connect(this.releaseNode);

    this.input = this.attackNode;
  }

  connect(destinationNode: AudioParam | AudioNode, output?: number, input?: number): AhdsrEnvelope {
    if (destinationNode instanceof AudioParam) {
      this.releaseNode.connect(destinationNode, output);
    } else {
      this.releaseNode.connect(destinationNode, output, input);
    }
    return this;
  }

  schedule(volume: number, startTime: number, releaseTime: number): AhdsrEnvelope {
    if (startTime >= 0) {
      this.attackNode.gain.setValueAtTime(0, startTime);
      this.attackNode.gain.linearRampToValueAtTime(this.gain * volume, startTime + this.envelope.attack);
      this.decayNode.gain.setTargetAtTime(this.envelope.sustain, startTime + this.envelope.attack + this.envelope.hold, this.envelope.decay);
    } else if (-startTime < this.envelope.attack) {
      const attackFraction = (-startTime) / this.envelope.attack;
      this.attackNode.gain.setValueAtTime(this.gain * volume * attackFraction, 0);
      this.attackNode.gain.linearRampToValueAtTime(this.gain * volume, startTime + this.envelope.attack);
      this.decayNode.gain.setTargetAtTime(this.envelope.sustain, startTime + this.envelope.attack + this.envelope.hold, this.envelope.decay);
    } else if (-startTime < this.envelope.attack + this.envelope.hold) {
      this.attackNode.gain.setValueAtTime(this.gain * volume, 0);
      this.decayNode.gain.setTargetAtTime(this.envelope.sustain, startTime + this.envelope.attack + this.envelope.hold, this.envelope.decay);
    } else {
      const decayTime = -startTime - this.envelope.attack - this.envelope.hold;
      const decayIntervals = decayTime / this.envelope.decay;
      const expVolume = Math.exp(-decayIntervals);
      const startVolume = expVolume * (1-this.envelope.sustain) + this.envelope.sustain;
      this.attackNode.gain.setValueAtTime(this.gain * volume, 0);
      this.decayNode.gain.setValueAtTime(startVolume, 0);
      this.decayNode.gain.setTargetAtTime(this.envelope.sustain, 0, this.envelope.decay);
    }

    this.releaseNode.gain.setValueAtTime(1, 0);
    this.releaseNode.gain.setTargetAtTime(0, releaseTime, this.envelope.release);

    return this;
  }
}

export class AhdEnvelope {
  private readonly ctx: BaseAudioContext;

  private readonly gain: number;
  private readonly envelope: ENVELOPE_AHD;

  private readonly attackNode: GainNode;
  private readonly decayNode: GainNode;

  readonly input: AudioNode;

  constructor(ctx: BaseAudioContext, gain: number, envelope: ENVELOPE_AHD) {
    this.ctx = ctx;
    this.gain = gain;
    this.envelope = envelope;

    this.attackNode = ctx.createGain();
    this.decayNode = ctx.createGain();

    this.attackNode.gain.value = 0;
    this.decayNode.gain.value = 1;

    this.attackNode.connect(this.decayNode);

    this.input = this.attackNode;
  }

  connect(destinationNode: AudioParam | AudioNode, output?: number, input?: number): AhdEnvelope {
    if (destinationNode instanceof AudioParam) {
      this.decayNode.connect(destinationNode, output);
    } else {
      this.decayNode.connect(destinationNode, output, input);
    }
    return this;
  }

  schedule(volume: number, startTime: number): AhdEnvelope {
    if (startTime >= 0) {
      this.attackNode.gain.setValueAtTime(0, startTime);
      this.attackNode.gain.linearRampToValueAtTime(this.gain * volume, startTime + this.envelope.attack);
      this.decayNode.gain.setTargetAtTime(0, startTime + this.envelope.attack + this.envelope.hold, this.envelope.decay);
    } else if (-startTime < this.envelope.attack) {
      const attackFraction = (-startTime) / this.envelope.attack;
      this.attackNode.gain.setValueAtTime(this.gain * volume * attackFraction, 0);
      this.attackNode.gain.linearRampToValueAtTime(this.gain * volume, startTime + this.envelope.attack);
      this.decayNode.gain.setTargetAtTime(0, startTime + this.envelope.attack + this.envelope.hold, this.envelope.decay);
    } else if (-startTime < this.envelope.attack + this.envelope.hold) {
      this.attackNode.gain.setValueAtTime(this.gain * volume, 0);
      this.decayNode.gain.setTargetAtTime(0, startTime + this.envelope.attack + this.envelope.hold, this.envelope.decay);
    } else {
      const decayTime = -startTime - this.envelope.attack - this.envelope.hold
      const decayIntervals = decayTime / this.envelope.decay;
      const startVolume = Math.exp(-decayIntervals);
      this.attackNode.gain.setValueAtTime(this.gain * volume, 0);
      this.decayNode.gain.setValueAtTime(startVolume, 0);
      this.decayNode.gain.setTargetAtTime(0, 0, this.envelope.decay);
    }
    return this;
  }
}
