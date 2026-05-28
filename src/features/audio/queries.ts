import { supabase } from '@/lib/supabase/client';
import type { AudioSource, ExerciseAudio } from './types';

const BUCKET = 'exercise-audio';
const SIGNED_URL_TTL_SEC = 60 * 60; // 1 hour — long enough for any workout

interface Row {
  id: string;
  user_id: string;
  exercise_id: string;
  source: AudioSource;
  storage_path: string | null;
  display_name: string | null;
  created_at: string;
}

function fromRow(r: Row): ExerciseAudio {
  return {
    id: r.id,
    userId: r.user_id,
    exerciseId: r.exercise_id,
    source: r.source,
    storagePath: r.storage_path,
    displayName: r.display_name,
    createdAt: r.created_at,
  };
}

export async function getExerciseAudio(
  userId: string,
  exerciseId: string,
): Promise<ExerciseAudio | null> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase
    .from('exercise_audio')
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as Row) : null;
}

/**
 * Upload an audio file to Storage and link it to (userId, exerciseId).
 * Replaces any existing assignment for that exercise (deletes the previous
 * storage object and the previous row).
 */
export async function assignAudio(input: {
  userId: string;
  exerciseId: string;
  fileUri: string;
  fileName: string;
  mimeType?: string;
}): Promise<ExerciseAudio> {
  if (!supabase) throw new Error('Supabase is not configured.');

  // Remove any existing assignment + storage object first.
  const existing = await getExerciseAudio(input.userId, input.exerciseId);
  if (existing?.storagePath) {
    await supabase.storage.from(BUCKET).remove([existing.storagePath]).catch(() => undefined);
  }
  if (existing) {
    await supabase.from('exercise_audio').delete().eq('id', existing.id);
  }

  // Read the local file as a blob and upload.
  const res = await fetch(input.fileUri);
  const blob = await res.blob();
  const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${input.userId}/${input.exerciseId}-${Date.now()}-${safeName}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: input.mimeType ?? 'audio/mpeg',
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data: inserted, error: insertError } = await supabase
    .from('exercise_audio')
    .insert({
      user_id: input.userId,
      exercise_id: input.exerciseId,
      source: 'local',
      storage_path: path,
      display_name: input.fileName,
    })
    .select('*')
    .single();
  if (insertError) throw insertError;

  return fromRow(inserted as Row);
}

export async function removeExerciseAudio(audio: ExerciseAudio): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.');
  if (audio.storagePath) {
    await supabase.storage.from(BUCKET).remove([audio.storagePath]).catch(() => undefined);
  }
  const { error } = await supabase.from('exercise_audio').delete().eq('id', audio.id);
  if (error) throw error;
}

/** Returns a short-lived signed URL the audio player can stream from. */
export async function signedUrlForAudio(
  audio: ExerciseAudio,
): Promise<string | null> {
  if (!supabase) throw new Error('Supabase is not configured.');
  if (audio.source !== 'local' || !audio.storagePath) return null;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(audio.storagePath, SIGNED_URL_TTL_SEC);
  if (error) throw error;
  return data?.signedUrl ?? null;
}
