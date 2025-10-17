import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

// Pantallas
import LoginScreen from '../components/LoginScreen';
import DashboardPatient from '../components/DashboardPatient';
import DashboardDoctor from '../components/DashboardDoctor';
import DashboardGuardian from '../components/DashboardGuardian';
import DashboardNurse from '../components/DashboardNurse';

// Tipos de roles
import type { UserRole } from '../types/medical';

const Stack = createNativeStackNavigator();

// Helper: obtener ruta según rol
const getDashboardRoute = (role: UserRole) => {
  switch (role) {
    case 'doctor':
      return 'DashboardDoctor';
    case 'patient':
      return 'DashboardPatient';
    case 'guardian':
      return 'DashboardGuardian';
    case 'nurse':
      return 'DashboardNurse';
    default:
      return 'Login';
  }
};

// Componente que protege rutas autenticadas
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#fa8fb5" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return children;
}

// Componente que decide qué pantalla mostrar al inicio
function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#fa8fb5" />
      </View>
    );
  }

  if (isAuthenticated && user) {
    const dashboard = getDashboardRoute(user.role);
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name={dashboard} component={resolveDashboard(user.role)} />
      </Stack.Navigator>
    );
  }

  return <LoginScreen />;
}

// Helper: retorna el componente correcto según el rol
function resolveDashboard(role: UserRole) {
  switch (role) {
    case 'doctor':
      return DashboardDoctor;
    case 'patient':
      return DashboardPatient;
    case 'guardian':
      return DashboardGuardian;
    case 'nurse':
      return DashboardNurse;
    default:
      return LoginScreen;
  }
}

// Router principal
export function AppRouter() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="HomePage"
        screenOptions={{ headerShown: false }}
      >
        {/* Ruta inicial */}
        <Stack.Screen name="HomePage" component={HomePage} />

        {/* Rutas protegidas */}
        <Stack.Screen
          name="DashboardDoctor"
          children={() => (
            <ProtectedRoute>
              <DashboardDoctor />
            </ProtectedRoute>
          )}
        />
        <Stack.Screen
          name="DashboardPatient"
          children={() => (
            <ProtectedRoute>
              <DashboardPatient />
            </ProtectedRoute>
          )}
        />
        <Stack.Screen
          name="DashboardGuardian"
          children={() => (
            <ProtectedRoute>
              <DashboardGuardian />
            </ProtectedRoute>
          )}
        />
        <Stack.Screen
          name="DashboardNurse"
          children={() => (
            <ProtectedRoute>
              <DashboardNurse />
            </ProtectedRoute>
          )}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
