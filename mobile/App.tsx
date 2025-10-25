import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator} from './src/AppRouter';
import { PatientProvider } from './src/context/PatientContext';

export default function App() {
  return (
    <AuthProvider>
      <PatientProvider>
        <AppNavigator />
      </PatientProvider>
    </AuthProvider>
  );
}