import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { useProfile } from '@/store/profile';
import { useBilling } from '@/store/billing';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  initialized: boolean;
  // True while the user is mid password-reset. Keeps the (auth) layout from
  // redirecting into the app after the recovery code creates a session, so the
  // reset screen can finish setting the new password first.
  recovery: boolean;
  init: () => Promise<void>;
  signOut: () => Promise<void>;
  setRecovery: (v: boolean) => void;
}

export const useAuth = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: false,
  initialized: false,
  recovery: false,

  init: async () => {
    if (!supabase) {
      set({ initialized: true });
      return;
    }
    const { data } = await supabase.auth.getSession();
    set({
      session: data.session,
      user: data.session?.user ?? null,
      initialized: true,
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });
  },

  signOut: async () => {
    if (!supabase) return;
    set({ loading: true });
    await supabase.auth.signOut();
    useProfile.getState().clear();
    useBilling.getState().clear();
    set({ session: null, user: null, loading: false, recovery: false });
  },

  setRecovery: (v: boolean) => set({ recovery: v }),
}));
