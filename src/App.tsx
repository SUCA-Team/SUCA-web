import { ThemeProvider } from './context/ThemeContext';
import { AppRouter } from './components/AppRouter';
import './styles/theme.css';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  );
}

export default App;
