import React from 'react';

interface LoginProps {
  onLogin: (role: 'admin' | 'viewer') => void;
}

declare const Login: React.FC<LoginProps>;
export default Login;
