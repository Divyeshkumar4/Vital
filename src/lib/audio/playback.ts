/**
 * Workout audio playback. One song plays at a time. expo-av runs in the
 * foreground during a workout — iOS background audio is a separate concern
 * (master prompt § 9; Phase 3 streaming work).
 */
import { Audio, type AVPlaybackSource } from 'expo-av';

let currentSound: Audio.Sound | null = null;
let audioModeConfigured = false;

async function configureAudioMode() {
  if (audioModeConfigured) return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      staysActiveInBackground: false,
    });
    audioModeConfigured = true;
  } catch {
    // Non-fatal — silent on Android, can still play in foreground on iOS.
  }
}

/**
 * Stop the currently playing sound (if any) and play the given URI from start.
 * Failure is silent — never let an audio issue interrupt a workout.
 */
export async function playFromUri(uri: string): Promise<void> {
  await configureAudioMode();
  await stopPlayback();
  try {
    const source: AVPlaybackSource = { uri };
    const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: true });
    currentSound = sound;
  } catch {
    currentSound = null;
  }
}

export async function stopPlayback(): Promise<void> {
  const s = currentSound;
  currentSound = null;
  if (!s) return;
  try {
    await s.stopAsync();
  } catch {
    /* ignore */
  }
  try {
    await s.unloadAsync();
  } catch {
    /* ignore */
  }
}

/** True while a sound is loaded (regardless of paused / playing state). */
export function isPlaying(): boolean {
  return currentSound !== null;
}
