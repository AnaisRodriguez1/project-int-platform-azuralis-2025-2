import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppRouter } from './context/AppRouter';
import { PatientProvider } from './context/PatientContext';

export default function App() {
  return (
    <AuthProvider>
      <PatientProvider>
        <AppRouter />
      </PatientProvider>
    </AuthProvider>
  );
}