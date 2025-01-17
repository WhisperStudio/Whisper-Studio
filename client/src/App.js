import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/main';
import VotePage from './pages/Vote'; // Import VotePage component

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vote" element={<VotePage />} /> {/* Add VotePage route */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;