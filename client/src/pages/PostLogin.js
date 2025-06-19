import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function PostLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('https://api.vintrastudio.com/api/me', { withCredentials: true })
      .then(res => {
        const role = res.data.user?.role;
        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/'); // eller til dashboard
        }
      })
      .catch(() => {
        navigate('/login');
      });
  }, [navigate]);

  return <p>Logger inn...</p>;
}
