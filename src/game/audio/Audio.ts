import { Howl, Howler } from 'howler';
import { prepareAudioForPlayback } from './AudioSession';
import rimAsset from '../../../assets/sounds/rim.mp3';
import swooshAsset from '../../../assets/sounds/swoosh.mp3';
import bounceAsset from '../../../assets/sounds/bounce.mp3';
import boardAsset from '../../../assets/sounds/board.mp3';

export type Sound = 'bounce' | 'rim' | 'board' | 'swoosh';

export class Audio {
  private recoveryTimer: number | null = null;
  private readonly onVisibilityChange = (): void => {
    if (document.hidden) {
      return;
    }

    prepareAudioForPlayback();
    this.recoveryTimer = window.setTimeout(() => {
      const context = Howler.ctx;
      if (!context || context.state === 'closed') {
        return;
      }

      // iOS Safari can report a running context while its output remains silent after app switching
      void context
        .suspend()
        .then(() => context.resume())
        .catch(() => {});
    }, 250);
  };
  private readonly sounds: Record<Sound, Howl> = {
    bounce: new Howl({ src: [bounceAsset], volume: 0.22 }),
    rim: new Howl({ src: [rimAsset], volume: 0.2 }),
    board: new Howl({ src: [boardAsset], volume: 0.2 }),
    swoosh: new Howl({ src: [swooshAsset], volume: 0.2 }),
  };

  constructor() {
    this.activate();
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  destroy(): void {
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    if (this.recoveryTimer !== null) {
      window.clearTimeout(this.recoveryTimer);
    }
  }

  activate(): void {
    prepareAudioForPlayback();
    if (Howler.ctx?.state !== 'running') {
      void Howler.ctx?.resume().catch(() => {});
    }
  }

  play(sound: Sound, volume?: number): void {
    const id = this.sounds[sound].play();
    if (volume !== undefined) {
      this.sounds[sound].volume(volume, id);
    }
    this.sounds[sound].rate(0.94 + Math.random() * 0.12, id);
  }
}
