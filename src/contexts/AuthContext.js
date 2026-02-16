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
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return data;
  };

  useEffect(() => {
    let mounted = true;

    // Check active session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      const user = session?.user ?? null;
      setCurrentUser(user);

      if (user) {
        const prof = await fetchProfile(user.id);
        if (mounted) setProfile(prof);
      }
      setLoading(false);
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    // Timeout fallback
    setTimeout(() => { if (mounted) setLoading(false); }, 3000);

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const user = session?.user ?? null;
        setCurrentUser(user);

        if (user) {
          const prof = await fetchProfile(user.id);
          setProfile(prof);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    // Go offline
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
      // Delete profile (cascades to messages via FK)
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
