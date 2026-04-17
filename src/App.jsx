import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Projects from './components/Projects';
import Footer from './components/Footer';
import SalesForecastDashboard from './pages/Sales';
import CustomerSegmentation from './pages/Customer';

const THEME_STORAGE_KEY = 'portfolio-theme';

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }

    return localStorage.getItem(THEME_STORAGE_KEY) || 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const isDark = theme === 'dark';
  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <Router>
      <div className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-slate-900' : 'bg-slate-50'
      }`}>
        <Navigation theme={theme} onToggleTheme={toggleTheme} />

        <Routes>
          <Route
            path="/"
            element={
              <>
                <Hero theme={theme} />
                <Projects theme={theme} />
                <Footer theme={theme} />
              </>
            }
          />
          <Route
            path="/sales-forecast"
            element={
              <SalesForecastDashboard />
            }
          />
          <Route
            path="/customer-segmentation"
            element={
              <CustomerSegmentation />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
