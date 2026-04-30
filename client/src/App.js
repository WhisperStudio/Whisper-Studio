// src/App.js
import React, { useEffect, lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Firebase
import { db, collection, addDoc, serverTimestamp } from './firebase';

// Pages
import Home from './pages/main';
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Careers = lazy(() => import('./pages/Careers'));
const VotePage = lazy(() => import('./pages/Vote'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const Admin = lazy(() => import('./pages/admin'));
const Login = lazy(() => import('./pages/login'));
const Artwork = lazy(() => import('./pages/artwork'));
const PostLogin = lazy(() => import('./pages/PostLogin'));
const BugReportPage = lazy(() => import('./pages/BugReportPage'));
const TestLanding = lazy(() => import('./pages/TestLanding'));

// NEW: Web development promo + estimator page
const WebDevPromoPage = lazy(() => import('./pages/Website/WebDevPromoPage'));

// Components
import Header from './components/header';
const Cursor = lazy(() => import('./components/Cursor'));
import ProtectedRoute from './components/ProtectedRoute';
// import ChatBot from './components/ChatBot'; // Old chatbot
import BugReportButton from './components/ADMIN/BugReportButton';
const ChatWidget = lazy(() => import('./components/ChatWidget').then(module => ({ default: module.ChatWidget })));

// Wrapper with Header
const MainLayout = ({ children }) => (
  <>
    <Header />
    {children}
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
  const [showCursor, setShowCursor] = useState(false);
  const [showChatWidget, setShowChatWidget] = useState(false);

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

    let idleHandle;
    let useTimeout = false;

    const loadNonCriticalUI = () => {
      setShowCursor(true);
      setShowChatWidget(true);
    };

    if ('requestIdleCallback' in window) {
      idleHandle = window.requestIdleCallback(loadNonCriticalUI, { timeout: 2000 });
    } else {
      idleHandle = window.setTimeout(loadNonCriticalUI, 2000);
      useTimeout = true;
    }

    return () => {
      if (useTimeout) {
        window.clearTimeout(idleHandle);
      } else if ('cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleHandle);
      }
    };
  }, []);

  return (
    <>
      {/* 👇 Global custom cursor – visible on all pages */}
      {showCursor && (
        <Suspense fallback={null}>
          <Cursor />
        </Suspense>
      )}
      
      {/* 👇 Chat Widget – visible on all pages */}
      {showChatWidget && (
        <Suspense fallback={null}>
          <ChatWidget />
        </Suspense>
      )}

      <BrowserRouter>
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading…</div>}>
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
            <Route path="/test-landing"    element={<TestLanding />} />

            {/* NEW route: Websites promo + estimator */}
            <Route
              path="/services/websites"
              element={<MainLayout><WebDevPromoPage /></MainLayout>}
            />

            {/* Login without Header */}
            <Route path="/login"          element={<Login />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}

export default App;
