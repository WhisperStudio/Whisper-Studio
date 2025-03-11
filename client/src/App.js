import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/main';
import VotePage from './pages/Vote'; // Import VotePage component
import ContactPage from './pages/ContactPage';
import Admin from './pages/admin'; // Import Admin component

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vote" element={<VotePage />} /> {/* Add VotePage route */}
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin" element={<Admin />} /> {/* Add Admin route */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;