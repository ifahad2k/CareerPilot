"use client";
// ============================================================
// Component: Firebase Session Provider
// ============================================================
// Wraps the app with Firebase auth state management.
// Uses Firebase's onAuthStateChanged for real-time session updates.
// ============================================================

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

interface FirebaseAuthContextType {
  user: User | null;
  loading: boolean;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType>({
  user: null,
  loading: true,
});

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <FirebaseAuthContext.Provider value={{ user, loading }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  return useContext(FirebaseAuthContext);
}