import { API_BASE_URL } from './api';
import { toast } from 'sonner';

// Google OAuth Configuration
export const GOOGLE_CONFIG = {
  clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  redirectUri: window.location.origin + "/#/login",
  scope: "openid profile email",
};

// Google OAuth Helper Functions
export const GoogleAuth = {
  // Initialize Google OAuth
  init: () => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CONFIG.clientId,
          callback: GoogleAuth.handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: false,
        });
        resolve(true);
      } else {
        // Load Google Identity Services script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CONFIG.clientId,
            callback: GoogleAuth.handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: false,
          });
          resolve(true);
        };
        document.head.appendChild(script);
      }
    });
  },

  // Handle Google OAuth response
  handleCredentialResponse: async (response: any) => {
    console.log('Google OAuth Response:', response);
    
    // Decode the JWT token to get user info
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const userInfo = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name,
        email_verified: payload.email_verified,
      };
      
      console.log('User Info:', userInfo);
      
      // Process user with backend API
      await GoogleAuth.processUserWithBackend(userInfo);
      
    } catch (error) {
      console.error('Error parsing Google OAuth response:', error);
    }
  },

  // Process user with backend API
  processUserWithBackend: async (userInfo: any) => {
    try {
      console.log('Processing user with backend:', userInfo);
      
      // Use the specific Google login API endpoint
      const googleLoginUrl = 'https://zktutorials.baawanerp.com/api/1/auth/google/login';
      console.log('Using Google login API:', googleLoginUrl);
      
      const loginPayload = {
        email: userInfo.email,
        name: userInfo.name,
        google_id: userInfo.id,
        profile_picture: userInfo.picture,
        email_verified: userInfo.verified_email
      };
      console.log('Google login payload:', loginPayload);
      
      const loginResponse = await fetch(googleLoginUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(loginPayload),
      });

      console.log('Google login response status:', loginResponse.status);
      console.log('Google login response ok:', loginResponse.ok);

      if (loginResponse.ok) {
        // Google login successful
        const userData = await loginResponse.json();
        console.log('Google login successful, user data:', userData);
        localStorage.setItem('token', JSON.stringify(userData));
        toast.success('Login successful!');
        window.location.hash = '/learner/homepage';
        window.location.reload();
      } else {
        // Google login failed
        const errorText = await loginResponse.text();
        console.error('Google login failed:', errorText);
        toast.error('Google login failed. Please try again.');
      }

    } catch (error) {
      console.error('Error processing user with backend:', error);
      toast.error('Authentication failed. Please try again.');
    }
  },

  // Sign in with Google
  signIn: () => {
    console.log('Google sign in initiated...');
    console.log('Current URL:', window.location.href);
    console.log('Redirect URI:', GOOGLE_CONFIG.redirectUri);
    // Use OAuth 2.0 flow directly for better compatibility
    GoogleAuth.signInWithOAuth2();
  },

  // Fallback OAuth 2.0 flow
  signInWithOAuth2: () => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CONFIG.clientId}&` +
      `redirect_uri=${encodeURIComponent(GOOGLE_CONFIG.redirectUri)}&` +
      `scope=${encodeURIComponent(GOOGLE_CONFIG.scope)}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    console.log('Redirecting to Google OAuth:', authUrl);
    window.location.href = authUrl;
  },

  // Handle OAuth 2.0 callback
  handleOAuth2Callback: async () => {
    console.log('OAuth 2.0 Callback handler called');
    console.log('Current URL:', window.location.href);
    console.log('Search params:', window.location.search);
    console.log('Hash:', window.location.hash);
    
    // Check both search params and hash for the code
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    
    const code = urlParams.get('code') || hashParams.get('code');
    const error = urlParams.get('error') || hashParams.get('error');
    
    console.log('OAuth 2.0 Callback - Code:', code, 'Error:', error);
    
    if (error) {
      console.error('OAuth 2.0 Error:', error);
      toast.error('Google authentication failed. Please try again.');
      window.location.hash = '/login';
      return;
    }
    
    if (code) {
      try {
        console.log('Processing OAuth code with backend...');
        
        // First, get user info from Google using the code
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: GOOGLE_CONFIG.clientId || '',
            client_secret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET || '',
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: GOOGLE_CONFIG.redirectUri || '',
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error('Failed to exchange code for token');
        }

        const tokenData = await tokenResponse.json();
        console.log('Token data received:', tokenData);

        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        });

        if (!userInfoResponse.ok) {
          throw new Error('Failed to get user info from Google');
        }

        const userInfo = await userInfoResponse.json();
        console.log('User info from Google:', userInfo);

        // Process user with backend API
        await GoogleAuth.processUserWithBackend(userInfo);

      } catch (error) {
        console.error('Error processing OAuth callback:', error);
        toast.error('Authentication failed. Please try again.');
        window.location.hash = '/login';
      }
    }
  },

  // Sign out
  signOut: () => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
      localStorage.removeItem('googleUser');
      localStorage.removeItem('token');
    }
  }
};

// Extend Window interface for Google
declare global {
  interface Window {
    google: any;
  }
}
