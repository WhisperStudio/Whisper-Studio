// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Hent Firebase‐instans og funksjoner
import { db, collection, addDoc, serverTimestamp } from './firebase';

import Home       from './pages/main';
import AboutUs    from './pages/AboutUs';
import Careers    from './pages/Careers';
import VotePage   from './pages/Vote';
import ContactPage from './pages/ContactPage';
import Admin      from './pages/admin';
import Login      from './pages/login';
import Artwork    from './pages/artwork';
import PostLogin  from './pages/PostLogin';
import Header     from './components/header';

// Layout‐wrapper som legger på Header
const MainLayout = ({ children }) => (
  <>
    <Header />
    {children}
  </>
);

function App() {
  // Loggfør besøk én gang per tab/vindu
  useEffect(() => {
    if (!sessionStorage.getItem('visitLogged')) {
      sessionStorage.setItem('visitLogged', 'true');

      fetch('https://ipapi.co/json')
        .then(res => res.json())
        .then(({ country }) => {
          return addDoc(collection(db, 'visitors'), {
            country,
            timestamp: serverTimestamp(),
          });
        })
        .catch(console.error);
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Sider med Header */}
        <Route path="/"           element={<MainLayout><Home /></MainLayout>} />
        <Route path="/vote"       element={<MainLayout><VotePage /></MainLayout>} />
        <Route path="/contact"    element={<MainLayout><ContactPage /></MainLayout>} />
        <Route path="/admin"      element={<MainLayout><Admin /></MainLayout>} />
        <Route path="/about-us"   element={<MainLayout><AboutUs /></MainLayout>} />
        <Route path="/careers"    element={<MainLayout><Careers /></MainLayout>} />
        <Route path="/artwork"    element={<MainLayout><Artwork /></MainLayout>} />
        <Route path="/post-login" element={<MainLayout><PostLogin /></MainLayout>} />
        {/* Login uten Header */}
        <Route path="/login"      element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
