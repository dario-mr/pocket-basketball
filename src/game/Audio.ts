import { Howl } from 'howler';

export type Sound = 'bounce' | 'rim' | 'board' | 'swish' | 'score' | 'combo' | 'perfect';

const wav = (frequency: number, duration: number): string => {
  const sampleRate = 8000;
  const samples = Math.floor(sampleRate * duration);
  const bytes = new Uint8Array(44 + samples);
  const view = new DataView(bytes.buffer);
  const write = (offset: number, value: string): void => {
    for (let i = 0; i < value.length; i += 1) bytes[offset + i] = value.charCodeAt(i);
  };
  write(0, 'RIFF');
  view.setUint32(4, 36 + samples, true);
  write(8, 'WAVEfmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  write(36, 'data');
  view.setUint32(40, samples, true);
  for (let i = 0; i < samples; i += 1) {
    const t = i / sampleRate;
    bytes[44 + i] =
      128 + Math.round(Math.sin(t * frequency * Math.PI * 2) * Math.exp(-t * 14) * 75);
  }
  return `data:audio/wav;base64,${btoa(String.fromCharCode(...bytes))}`;
};

export class Audio {
  private readonly sounds: Record<Sound, Howl> = {
    bounce: new Howl({ src: [wav(95, 0.12)], volume: 0.25 }),
    rim: new Howl({ src: [wav(450, 0.08)], volume: 0.17 }),
    board: new Howl({ src: [wav(180, 0.1)], volume: 0.15 }),
    swish: new Howl({ src: [wav(700, 0.2)], volume: 0.2 }),
    score: new Howl({ src: [wav(520, 0.18)], volume: 0.2 }),
    combo: new Howl({ src: [wav(880, 0.2)], volume: 0.2 }),
    perfect: new Howl({ src: [wav(1040, 0.3)], volume: 0.2 }),
  };
  play(sound: Sound): void {
    const id = this.sounds[sound].play();
    this.sounds[sound].rate(0.94 + Math.random() * 0.12, id);
  }
}
