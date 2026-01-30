// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Firebase
import { db, collection, addDoc, serverTimestamp } from './firebase';

// Pages
import Home        from './pages/main';
import AboutUs     from './pages/AboutUs';
import Careers     from './pages/Careers';
import VotePage    from './pages/Vote';
import ContactPage from './pages/ContactPage';
import Admin       from './pages/admin';
import Login       from './pages/login';
import Artwork     from './pages/artwork';
import PostLogin   from './pages/PostLogin';
import BugReportPage from './pages/BugReportPage';

// NEW: Web development promo + estimator page
// Make sure this file exists, e.g. src/pages/WebDevPromoPage.jsx
import WebDevPromoPage from './pages/Website/WebDevPromoPage';

// Components
import Header from './components/header';
import Cursor from './components/Cursor';
import ProtectedRoute from './components/ProtectedRoute';
// import ChatBot from './components/ChatBot'; // Old chatbot
import EnhancedChatBot from './components/EnhancedChatBot'; // New enhanced chatbot
import BugReportButton from './components/ADMIN/BugReportButton';

// Wrapper with Header
const MainLayout = ({ children }) => (
  <>
    <Header />
    {children}
    <EnhancedChatBot />
  </>
);

// Admin Layout with Bug Report Button
const AdminLayout = ({ children }) => (
  <>
    <Header />
    {children}
    <BugReportButton />
  </>
);

function App() {
  // Log visit once per tab
  useEffect(() => {
    if (!sessionStorage.getItem('visitLogged')) {
      sessionStorage.setItem('visitLogged', 'true');

      fetch('https://ipapi.co/json')
        .then(res => res.json())
        .then(({ country }) =>
          addDoc(collection(db, 'visitors'), {
            country,
            timestamp: serverTimestamp(),
          })
        )
        .catch(console.error);
    }
  }, []);

  return (
    <>
      {/* 👇 Global custom cursor – visible on all pages */}
      <Cursor />

      <BrowserRouter>
        <Routes>
          <Route path="/"               element={<MainLayout><Home /></MainLayout>} />
          <Route path="/vote"           element={<MainLayout><VotePage /></MainLayout>} />
          <Route path="/contact"        element={<MainLayout><ContactPage /></MainLayout>} />
          <Route path="/bug-report"     element={<MainLayout><BugReportPage /></MainLayout>} />
          <Route path="/admin"          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout><Admin /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/about-us"       element={<MainLayout><AboutUs /></MainLayout>} />
          <Route path="/careers"        element={<MainLayout><Careers /></MainLayout>} />
          <Route path="/artwork"        element={<MainLayout><Artwork /></MainLayout>} />
          <Route path="/post-login"     element={<MainLayout><PostLogin /></MainLayout>} />
          
          {/* NEW route: Websites promo + estimator */}
          <Route
            path="/services/websites"
            element={<MainLayout><WebDevPromoPage /></MainLayout>}
          />

          {/* Login without Header */}
          <Route path="/login"          element={<Login />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
