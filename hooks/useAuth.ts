
import { useState, useEffect, useCallback } from 'react';
import { auth } from '../firebase';
import { 
  User, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';

export const useAuth = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const signup = useCallback(async (email: string, password_plaintext: string) => {
        await createUserWithEmailAndPassword(auth, email, password_plaintext);
    }, []);

    const login = useCallback(async (email: string, password_plaintext: string) => {
        await signInWithEmailAndPassword(auth, email, password_plaintext);
    }, []);

    const logout = useCallback(() => {
        signOut(auth);
    }, []);

    return {
        currentUser,
        loading,
        signup,
        login,
        logout,
    };
};
