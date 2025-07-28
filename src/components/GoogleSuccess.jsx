import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';

const GoogleSuccess = () => {
  const navigate = useNavigate();
  const { setAuthenticated, setRole, setUserId } = useUser();
  const query = new URLSearchParams(useLocation().search);

  useEffect(() => {
    const token = query.get('token');
    const userId = query.get('userId');
    const role = query.get('role');

    if (token) {
      localStorage.setItem('token', token);
      setAuthenticated(true);
      setRole(role);
      setUserId(userId);
      navigate('/home');
    }
  }, []);

  return <div>Signing you in...</div>;
};

export default GoogleSuccess;
