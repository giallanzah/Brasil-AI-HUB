import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Update user profile in Firestore
        try {
          await setDoc(doc(db, 'users', user.uid), {
            displayName: user.displayName || user.email?.split('@')[0] || 'Hub Member',
            photoURL: user.photoURL || '',
            lastSeen: serverTimestamp(),
            status: 'online'
          }, { merge: true });
        } catch (error) {
          console.error("Error updating user profile:", error);
        }
      }
      setLoading(loading => {
        if (loading) return false;
        return loading;
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
