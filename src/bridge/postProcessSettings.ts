import { Instrument } from "../constants";

export const maxNoteLengths: Record<Exclude<Instrument, "drums">, number | null> = {
  bass: 5,
  guitar: 5,
  harp: 5,
  piano: 10,
  violin: 10,
  cello: 10,
  flute: 10,
  trumpet: 10,
  clarinet: 10
}

export const minNoteLengths: Record<Exclude<Instrument, "drums">, number | null> = {
  bass: 0.02,
  guitar: 0.02,
  harp: 0.02,
  piano: 0.02,
  violin: 0.02,
  cello: 0.02,
  flute: 0.02,
  trumpet: 0.02,
  clarinet: 0.02
}

export const minNoteSeparation: Record<Exclude<Instrument, "drums">, number> = {
  bass: 0.01,
  guitar: 0.01,
  harp: 0.01,
  piano: 0.01,
  violin: 0.01,
  cello: 0.01,
  flute: 0.01,
  trumpet: 0.01,
  clarinet: 0.01
}