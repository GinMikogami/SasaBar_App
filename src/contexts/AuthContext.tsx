"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
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
  const userCache = useRef<Record<string, User>>({});

  useEffect(() => {
    return onAuthChanged((fbUser) => {
      setFirebaseUser(fbUser);

      if (!fbUser) {
        userCache.current = {};
        setUser(null);
        setLoading(false);
        return;
      }

      // キャッシュがあれば即座に表示
      if (userCache.current[fbUser.uid]) {
        setUser(userCache.current[fbUser.uid]);
        setLoading(false);
        return;
      }

      // キャッシュなし: Firestoreから取得（loadingはtrueのまま）
      getUser(fbUser.uid).then((userData) => {
        if (userData) {
          userCache.current[fbUser.uid] = userData;
          setUser(userData);
        }
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    });
  }, []);

  async function refreshUser() {
    if (firebaseUser) {
      const userData = await getUser(firebaseUser.uid);
      if (userData) {
        userCache.current[firebaseUser.uid] = userData;
        setUser(userData);
      }
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
