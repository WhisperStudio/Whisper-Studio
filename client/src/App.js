// App.js
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/main';
import VotePage from './pages/Vote';
import ContactPage from './pages/ContactPage';
import Admin from './pages/admin';
// IMPORTER Bifrost i stedet for TicketingIframe:
import Bifrost from './components/bifrost';
import Login from './pages/login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/vote" element={<VotePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      {/* Vis Bifrost på alle sider */}
      <Bifrost />
    </BrowserRouter>
  );
}

export default App;
