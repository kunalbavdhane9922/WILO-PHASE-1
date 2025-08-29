// src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ModelList from './components/ModelList';
import GameifiedProductShowcase from './components/GameifiedProductShowcase';
import AdminPanel from './components/AdminPanel'; // 👈 1. Import AdminPanel
// import './App.css';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="content">
        <Routes>
          <Route path="/" element={<ModelList />} />
          <Route path="/products/:id" element={<GameifiedProductShowcase />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;