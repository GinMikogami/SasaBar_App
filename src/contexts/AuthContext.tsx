"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User as FirebaseUser } from "firebase/auth";
import { onAuthChanged } from "@/lib/firebase/auth";
import { getUser } from "@/lib/firebase/firestore";
import type { User } from "@/types";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  user: null,
  loading: true,
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUser(fbUser: FirebaseUser | null) {
    if (!fbUser) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const userData = await getUser(fbUser.uid);
      setUser(userData);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    return onAuthChanged((fbUser) => {
      setFirebaseUser(fbUser);
      loadUser(fbUser);
    });
  }, []);

  async function refreshUser() {
    if (firebaseUser) {
      const userData = await getUser(firebaseUser.uid);
      setUser(userData);
    }
  }

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
