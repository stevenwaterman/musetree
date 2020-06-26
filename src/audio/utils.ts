const A4 = 440;
export function toFrequency(pitch: number) {
  return A4 * Math.pow(2, (pitch - 69) / 12);
}