import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginModal from '../../components/common/LoginModal';
import useAuth from '../../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const user = auth?.user ?? null;

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleClose = () => {
    // Navigate back to previous page or home
    navigate(-1);
  };

  return (
    <>
      <LoginModal open={true} onClose={handleClose} />
    </>
  );
};

export default LoginPage;
