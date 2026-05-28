export type AudioSource = 'local' | 'spotify' | 'apple';

export interface ExerciseAudio {
  id: string;
  userId: string;
  exerciseId: string;
  source: AudioSource;
  storagePath: string | null;
  displayName: string | null;
  createdAt: string;
}
