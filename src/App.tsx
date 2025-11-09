import { ThemeProvider } from './context/ThemeContext';
import { AppRouter } from './components/AppRouter';
import './styles/theme.css';
import './App.css';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppRouter />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
