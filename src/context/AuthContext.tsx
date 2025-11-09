import React, { createContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';

interface AuthContextValue {
	user: FirebaseUser | null;
	loading: boolean;
}

export const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<FirebaseUser | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		if (!auth) {
			setLoading(false);
			return;
		}
		const unsubscribe = onAuthStateChanged(auth, (u) => {
			setUser(u);
			setLoading(false);
		});
		return () => unsubscribe();
	}, []);

	return (
		<AuthContext.Provider value={{ user, loading }}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
