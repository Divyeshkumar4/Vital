/**
 * Workout audio playback. One song plays at a time.
 *
 * Phase 2.6 re-enable (2026-05-28): migrated from expo-av → expo-audio (the
 * SDK 54+ replacement) and pre-download the file with expo-file-system before
 * playback. Playing a `file://` URI is more reliable on iOS than streaming a
 * Supabase Storage signed URL (which 302-redirects + has variable content-type).
 *
 * Failure is intentionally silent — never let an audio glitch interrupt a set.
 */
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';

let currentPlayer: AudioPlayer | null = null;
let audioModeConfigured = false;

async function configureAudioMode(): Promise<void> {
  if (audioModeConfigured) return;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'duckOthers',
      interruptionModeAndroid: 'duckOthers',
    });
    audioModeConfigured = true;
  } catch {
    // Non-fatal — playback can still work on the platform that didn't accept the call.
  }
}

function unloadCurrent(): void {
  const p = currentPlayer;
  currentPlayer = null;
  if (!p) return;
  try {
    p.pause();
  } catch {
    /* ignore */
  }
  try {
    p.remove();
  } catch {
    /* ignore */
  }
}

/**
 * Download the remote URL to the device's cache directory and return the
 * resulting `file://` URI. Returns null on failure.
 */
async function downloadToCache(url: string, suggestedName: string): Promise<string | null> {
  try {
    const dir = FileSystem.cacheDirectory;
    if (!dir) return null;
    const safe = suggestedName.replace(/[^a-zA-Z0-9._-]/g, '_') || 'hype-song';
    const dest = `${dir}vital-hype-${Date.now()}-${safe}`;
    const res = await FileSystem.downloadAsync(url, dest);
    if (!res.uri) return null;
    return res.uri;
  } catch {
    return null;
  }
}

/**
 * Play the given remote URL. The file is downloaded to local cache first and
 * the player is pointed at the `file://` URI — this is the path that actually
 * produces audible output reliably in Expo Go on iOS (the earlier signed-URL
 * + streaming approach did not, see DECISIONS 2026-05-24).
 */
export async function playFromUri(url: string, suggestedName = 'hype.mp3'): Promise<void> {
  await configureAudioMode();
  unloadCurrent();
  const localUri = url.startsWith('file://') ? url : await downloadToCache(url, suggestedName);
  if (!localUri) return;
  try {
    const player = createAudioPlayer({ uri: localUri });
    currentPlayer = player;
    player.play();
  } catch {
    currentPlayer = null;
  }
}

export async function stopPlayback(): Promise<void> {
  unloadCurrent();
}

/** True while a player is loaded (regardless of paused / playing state). */
export function isPlaying(): boolean {
  return currentPlayer !== null;
}
