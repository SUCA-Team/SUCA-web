/* eslint-disable react-refresh/only-export-components */
import { createContext } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';

export interface AuthContextValue {
	user: FirebaseUser | null;
	loading: boolean;
}

export const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export default AuthContext;
