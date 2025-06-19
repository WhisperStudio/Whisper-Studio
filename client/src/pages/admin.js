// src/pages/Admin.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);

  // 🔐 Sjekk om bruker er logget inn og er admin
  useEffect(() => {
    axios
      .get('https://api.vintrastudio.com/api/me', { withCredentials: true })
      .then(res => {
        if (res.data?.user?.role === 'admin') {
          setUser(res.data.user);
          setAuthChecked(true);
        } else {
          navigate('/login');
        }
      })
      .catch(() => {
        navigate('/login');
      });
  }, [navigate]);

  if (!authChecked) return <div>Laster admin…</div>;

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Velkommen, admin {user.username || user.email}</h1>
      <p>Du er logget inn som administrator og kan nå bruke admin-panelet.</p>

      {/* Eksempel på admin-funksjoner */}
      <div style={{ marginTop: '2rem' }}>
        <h2>Admin-verktøy</h2>
        <ul>
          <li>📋 Se brukerdata</li>
          <li>💬 Håndter samtaler</li>
          <li>⚙️ Juster systeminnstillinger</li>
        </ul>
      </div>
    </div>
  );
}
