import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface User {
  uid: string;
  name: string;
  email: string;
  role?: 'end_user' | 'support_agent' | 'admin'; // You may want to fetch this from Firestore
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch additional user info (like role) from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          let role: 'end_user' | 'support_agent' | 'admin' = 'end_user';
          let name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            role = userData.role || 'end_user';
            name = userData.name || name;
          }
          
          setUser({
            uid: firebaseUser.uid,
            name,
            email: firebaseUser.email || "",
            role,
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Set default user data if Firestore fetch fails
          setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || "",
            role: 'end_user',
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    await signInWithEmailAndPassword(auth, email, password);
    setLoading(false);
  };

  const logout = () => {
    signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};