import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Change from HashRouter back to BrowserRouter

import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Projects from './components/Projects';
import Footer from './components/Footer';
import SalesForecastDashboard from './pages/Sales';
import CustomerSegmentation from './pages/Customer';

function App() {
  return (
    <Router>
      <div className="bg-slate-900 min-h-screen">
        <Navigation />

        <Routes>
          <Route
            path="/"
            element={
              <>
                <Hero />
                <Projects />
                <Footer />
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