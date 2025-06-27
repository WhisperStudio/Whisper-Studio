// App.js
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/main';
import AboutUs from './pages/AboutUs';
import Careers from './pages/Careers';
import VotePage from './pages/Vote';
import ContactPage from './pages/ContactPage';
import Admin from './pages/admin';
// IMPORTER Bifrost i stedet for TicketingIframe:
import Login from './pages/login';
import Artwork from './pages/artwork';
import PostLogin from './pages/PostLogin';
import Header from './components/header'; // Import Header

// Layout component to wrap pages with the header
const MainLayout = ({ children }) => (
  <>
    <Header />
    {children}
  </>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes with Header */}
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/vote" element={<MainLayout><VotePage /></MainLayout>} />
        <Route path="/contact" element={<MainLayout><ContactPage /></MainLayout>} />
        <Route path="/admin" element={<MainLayout><Admin /></MainLayout>} />
        <Route path="/about-us" element={<MainLayout><AboutUs /></MainLayout>} />
        <Route path="/careers" element={<MainLayout><Careers /></MainLayout>} />
        <Route path="/artwork" element={<MainLayout><Artwork /></MainLayout>} />
        <Route path="/post-login" element={<MainLayout><PostLogin /></MainLayout>} />

        {/* Route without Header (e.g., login page) */}
        <Route path="/login" element={<Login />} />
      </Routes>
      {/* Vis Bifrost på alle sider */}
    </BrowserRouter>
  );
}

export default App;
