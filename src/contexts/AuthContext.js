import React, { useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch profile from DB ─────────────────────────────────
  const fetchProfile = async (userId) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      return data;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Use onAuthStateChange as the single source of truth.
    // It fires with INITIAL_SESSION on mount (replaces getSession),
    // and SIGNED_IN / SIGNED_OUT / TOKEN_REFRESHED during the session.
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        const user = session?.user ?? null;
        setCurrentUser(user);

        if (user) {
          // Fetch profile only once per auth event
          const prof = await fetchProfile(user.id);
          if (mounted) {
            setProfile(prof);
            setLoading(false);
          }
        } else {
          setProfile(null);
          if (mounted) setLoading(false);
        }
      }
    );

    // Safety timeout — if onAuthStateChange never fires (unlikely),
    // stop blocking the UI after 5 seconds.
    const timeout = setTimeout(() => {
      if (mounted && loading) setLoading(false);
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      listener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    if (currentUser) {
      await supabase.from('profiles').update({
        is_online: false,
        last_seen: new Date().toISOString(),
      }).eq('id', currentUser.id);
    }
    await supabase.auth.signOut();
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (currentUser) {
      const prof = await fetchProfile(currentUser.id);
      setProfile(prof);
    }
  };

  const deleteAccount = async () => {
    if (currentUser) {
      await supabase.from('profiles').delete().eq('id', currentUser.id);
      await supabase.auth.signOut();
      setProfile(null);
      setCurrentUser(null);
    }
  };

  const value = {
    currentUser,
    profile,
    loading,
    logout,
    refreshProfile,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
