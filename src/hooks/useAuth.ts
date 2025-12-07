import { useContext } from 'react';
import AuthContext from '../context/AuthContextValue';

export default function useAuth() {
	return useContext(AuthContext);
}
