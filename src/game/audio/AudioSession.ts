// iOS exposes this non-standard audio-session extension.
type AudioSessionType = 'auto' | 'ambient' | 'playback' | 'play-and-record' | 'transient';

interface NavigatorWithAudioSession extends Navigator {
  audioSession?: { type: AudioSessionType };
}

export const prepareAudioForPlayback = (): void => {
  const audioSession = (navigator as NavigatorWithAudioSession).audioSession;
  if (!audioSession) {
    return;
  }

  try {
    if (audioSession.type !== 'playback') {
      audioSession.type = 'playback';
    }
  } catch {
    // Some browsers expose the API without allowing it to be changed.
  }
};
