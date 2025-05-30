import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App'; // Import the useAuth hook
import './Login.css'; // Import the new CSS file

const clientId = '648290339002-m6jugfu5bdp02e1vrar28p82658jgvsq.apps.googleusercontent.com'; // Updated Client ID

interface CredentialResponse {
  credential?: string;
  select_by?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth(); // Get the login function and isAuthenticated from AuthContext
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is already authenticated
    const savedAuth = localStorage.getItem('isAuthenticated');
    const savedToken = localStorage.getItem('authToken');
    const sessionAuth = sessionStorage.getItem('isAuthenticated');
    
    if ((savedAuth === 'true' && savedToken) || sessionAuth === 'true') {
      // User is already authenticated, redirect to dashboard
      navigate('/');
    }
  }, [navigate]);

  const handleCredentialResponse = (response: CredentialResponse) => {
    console.log("Encoded JWT ID token: " + response.credential);
    if (response.credential) {
      // Call the login function from AuthContext
      login(response.credential);
      // Redirect to the dashboard after successful login
      navigate('/');
    }
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, accept any non-empty credentials
    if (email && password) {
      login('manual-login-token');
      navigate('/');
    } else {
      setError('Please enter both email and password');
    }
  };

  const handleContinueWithoutLogin = () => {
    sessionStorage.setItem('isAuthenticated', 'true');
    window.location.href = '/'; // Force a full page reload to update auth state
  };

  useEffect(() => {
    // @ts-ignore
    if (window.google) {
      // @ts-ignore
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse
      });

      // @ts-ignore
      window.google.accounts.id.renderButton(
        document.getElementById("google-sign-in-button"),
        { theme: "outline", size: "large" }  // Customization options
      );
       // @ts-ignore
      window.google.accounts.id.prompt(); // Also display the One Tap dialog

    }
  }, []); // Add login and navigate to the dependency array

  // If already authenticated, don't show login page
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="login-container light-theme">
      <div className="login-card">
        <h2>Login</h2>
        <p>Sign in to access the dashboard</p>
        
        <form onSubmit={handleManualLogin} className="login-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        <div className="login-divider">
          <span>or</span>
        </div>

        <div id="google-sign-in-button"></div>

        <div className="login-divider">
          <span>or</span>
        </div>

        <button 
          className="continue-without-login"
          onClick={handleContinueWithoutLogin}
        >
          Continue without Login
        </button>
      </div>
    </div>
  );
};

export default Login; 