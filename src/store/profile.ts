import { create } from 'zustand';
import { fetchProfile, upsertProfile } from '@/features/profile/queries';
import type { Profile } from '@/features/profile/types';

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  loaded: boolean;
  error: string | null;
  load: (userId: string) => Promise<void>;
  save: (userId: string, patch: Partial<Profile>) => Promise<void>;
  clear: () => void;
}

export const useProfile = create<ProfileState>((set) => ({
  profile: null,
  loading: false,
  loaded: false,
  error: null,

  load: async (userId) => {
    set({ loading: true, error: null });
    try {
      const profile = await fetchProfile(userId);
      set({ profile, loaded: true, loading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), loading: false, loaded: true });
    }
  },

  save: async (userId, patch) => {
    set({ loading: true, error: null });
    try {
      const profile = await upsertProfile(userId, patch);
      set({ profile, loading: false, loaded: true });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), loading: false });
      throw e;
    }
  },

  clear: () => set({ profile: null, loaded: false, error: null }),
}));
