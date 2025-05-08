import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { File as FileTree } from 'lucide-react';

const Login: React.FC = () => {
  const { signIn } = useAuth();

  useEffect(() => {
    const initializeGoogleSignIn = async () => {
      if (!window.google?.accounts) {
        console.error('Google Sign-In SDK not loaded');
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: async (response) => {
            try {
              await signIn(response.credential);
            } catch (error) {
              console.error('Login failed:', error);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });

        window.google.accounts.id.renderButton(
          document.getElementById("googleSignInButton")!,
          { 
            type: "standard",
            theme: "filled_blue",
            size: "large",
            width: 250,
            text: "signin_with",
            shape: "rectangular"
          }
        );
      } catch (error) {
        console.error('Failed to initialize Google Sign-In:', error);
      }
    };

    initializeGoogleSignIn();
  }, [signIn]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <FileTree size={48} className="text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to NodeTree</h1>
          <p className="text-muted-foreground">Sign in to start organizing your thoughts</p>
        </div>

        <div className="bg-white/5 p-8 rounded-lg shadow-lg backdrop-blur-sm border border-white/10">
          <div id="googleSignInButton" className="flex justify-center"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;