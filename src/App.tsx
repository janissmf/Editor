import React from 'react';
import { TreeProvider } from './context/TreeContext';
import { AuthProvider } from './context/AuthContext';
import NodeTree from './components/NodeTree';
import Login from './components/Login';
import { useAuth } from './context/AuthContext';

function AuthenticatedApp() {
  const { isAuthenticated } = useAuth();
  const authEnabled = import.meta.env.VITE_AUTH_ENABLED !== 'false';

  if (authEnabled && !isAuthenticated) {
    return <Login />;
  }

  return (
    <TreeProvider>
      <NodeTree />
    </TreeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;