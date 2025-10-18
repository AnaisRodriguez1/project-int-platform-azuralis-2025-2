import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { AppRouter } from './src/navigation/AppRouter';

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
