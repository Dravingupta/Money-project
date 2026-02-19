import React from 'react';
import Home from './pages/Home';
import { Shield } from 'lucide-react';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="navbar-logo">
            <Shield size={20} />
          </div>
          <div>
            <div className="navbar-title">FinForensics</div>
            <div className="navbar-subtitle">Graph-Based Crime Detection</div>
          </div>
        </div>
        <div className="navbar-status">
          <span className="status-dot" />
          Engine Online
        </div>
      </nav>
      <main className="main-content">
        <Home />
      </main>
    </div>
  );
}

export default App;
