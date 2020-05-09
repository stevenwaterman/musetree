import {AhdsrEnvelope} from "../nodes/envelopes";
import {InstrumentSynth} from "../nodes/InstrumentSynth";
import {Note} from "../../state/notes";
import {toFrequency} from "../utils";

export class Violin extends InstrumentSynth<"violin">{
    protected instrument = "violin" as const;

    async setup(ctx: BaseAudioContext, destination: AudioNode): Promise<void> {
    }

    async loadNote(note: Note, ctx: BaseAudioContext, destination: AudioNode): Promise<void> {
        const osc = ctx.createOscillator();
        osc.frequency.value = toFrequency(note.pitch);
        osc.type = "sawtooth";

        const vibrato = ctx.createOscillator();
        vibrato.frequency.value = 6.43;
        vibrato.type = "sine";

        const vibratoEnvelope = new AhdsrEnvelope(ctx, 5, {
            attack: 1,
            hold: 0.1,
            decay: 1,
            sustain: 0.9,
            release: 0.01
        });
        vibrato.connect(vibratoEnvelope.input);
        vibratoEnvelope.connect(osc.detune);

        const envelope = new AhdsrEnvelope(ctx, 1, {
            attack: 0.1,
            hold: 0,
            decay: 0.3,
            sustain: 0.6,
            release: 0.03
        });
        osc.connect(envelope.input);

        const lowPass = ctx.createBiquadFilter();
        envelope.connect(lowPass);
        lowPass.type = "lowpass";
        lowPass.gain.value = 12;
        lowPass.frequency.value = 6000;

        const filterBankSettings = [
            {
                sigIn: 0.5,
                gain: 24,
                freq: 300,
                resonance: 3
            }, {
                sigIn: 0.8,
                gain: 24,
                freq: 700,
                resonance: 3
            }, {
                sigIn: 1,
                gain: 12,
                freq: 3000,
                resonance: 0.5
            }
        ];

        const highPass = ctx.createBiquadFilter();
        highPass.connect(destination);
        highPass.type = "highpass";
        highPass.gain.value = 12;
        highPass.frequency.value = 200;

        const filterBank = filterBankSettings.map(settings => {
            const gain = ctx.createGain();
            gain.gain.value = settings.sigIn;

            const filter = ctx.createBiquadFilter();
            filter.frequency.value = settings.freq;
            filter.gain.value = settings.gain;
            filter.Q.value = settings.resonance;
            filter.type = "bandpass";
            lowPass.connect(gain);
            gain.connect(filter);
            filter.connect(highPass);
        });
        // lowPass.connect(highPass);

        osc.start(note.startTime);
        osc.stop(note.endTime + 1);
        vibrato.start(note.startTime);
        vibrato.stop(note.endTime + 1);
        vibratoEnvelope.schedule(1, note.startTime, note.endTime);
        envelope.schedule(note.volume, note.startTime, note.endTime);
    }
}
