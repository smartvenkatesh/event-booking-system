import React from 'react';
import { GoogleLogin} from '@react-oauth/google';
import { decodeToken } from '../utils/decodeToken';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import { toast } from 'react-toastify';

const GoogleAuth = () => {
  const navigate = useNavigate();
  const { setAuthenticated, setRole, setUserId } = useUser();

  const handleSuccess = async (credentialResponse) => {
    console.log("credentialResponse",credentialResponse);
    
    try {
      const { credential } = credentialResponse;
      const decoded = decodeToken(credential);
      console.log("decoded-credential",decoded);
      
      const res = await axios.post('http://localhost:8080/events/google-auth', {
        token: credential,
      });

      const { token, userId, role } = res.data;

      localStorage.setItem('token', token);
      setAuthenticated(true);
      console.log("googleAuth",res.data);
      
      setRole(role);
      setUserId(userId);
      navigate('/home');
    } catch (err) {
      toast.error('Google Auth failed');
    }
  };
  const handleLogin = () => {
  window.location.href = "http://localhost:8080/events/auth/google";
};

  return (
    <div>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => toast.error("Login Failed")}
      />
    </div>
  );
};

export default GoogleAuth;
