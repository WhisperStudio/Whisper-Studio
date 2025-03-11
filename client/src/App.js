// App.js
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/main';
import VotePage from './pages/Vote';
import ContactPage from './pages/ContactPage';
import Admin from './pages/admin';
import TicketingIframe from './components/TicketingIframe';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vote" element={<VotePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      {/* TicketingIframe vises på alle sider */}
      <TicketingIframe />
    </BrowserRouter>
  );
}

export default App;
