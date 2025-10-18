import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { AppRouter } from './src/navigation/AppRouter';
import { PatientProvider } from './src/context/PatientContext';

export default function App() {
  return (
    <AuthProvider>
      <PatientProvider>
        <AppRouter />
      </PatientProvider>
    </AuthProvider>
  );
}