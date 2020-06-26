declare module "audiobuffer-to-wav" {
  function audioBufferToWav(buffer: AudioBuffer, opts?: {
    float32: 3 | undefined;
    bitDepth: 3 | undefined;
  }): ArrayBuffer;
  export = audioBufferToWav;
}