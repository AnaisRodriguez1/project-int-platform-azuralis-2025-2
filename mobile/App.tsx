import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { AppRouter } from './AppRouter';
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