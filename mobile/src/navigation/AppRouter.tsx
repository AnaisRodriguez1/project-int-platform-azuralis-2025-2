import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

// Pantallas
import LoginScreen from '../components/LoginScreen';
import RegisterScreen from '../components/RegisterScreen';
import DashboardPatient from '../pages/Patient/DashboardPatient';
import DashboardDoctor from '../components/DashboardDoctor';
import DashboardGuardian from '../components/DashboardGuardian';
import DashboardNurse from '../components/DashboardNurse';

// Tipos de roles
import type { UserRole } from '../types/medical';

const Stack = createNativeStackNavigator();

// Helper: obtener nombre de ruta según rol
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

// Decide pantalla inicial según estado de sesión
function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#fa8fb5" />
      </View>
    );
  }

  // Si está autenticado, redirige al dashboard correcto
  if (isAuthenticated && user) {
    const DashboardComponent = resolveDashboard(user.role);
    return (
      <ProtectedRoute>
        <DashboardComponent />
      </ProtectedRoute>
    );
  }

  // Si no hay sesión activa, muestra login
  return <LoginScreen />;
}

// Devuelve el componente correspondiente según el rol
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

// 🌐 Router principal
export function AppRouter() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="HomePage"
        screenOptions={{ headerShown: false }}
      >
        {/* Rutas públicas */}
        <Stack.Screen name="HomePage" component={HomePage} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* Dashboards protegidos */}
        <Stack.Screen name="DashboardDoctor">
          {() => (
            <ProtectedRoute>
              <DashboardDoctor />
            </ProtectedRoute>
          )}
        </Stack.Screen>

        <Stack.Screen name="DashboardPatient">
          {() => (
            <ProtectedRoute>
              <DashboardPatient />
            </ProtectedRoute>
          )}
        </Stack.Screen>

        <Stack.Screen name="DashboardGuardian">
          {() => (
            <ProtectedRoute>
              <DashboardGuardian />
            </ProtectedRoute>
          )}
        </Stack.Screen>

        <Stack.Screen name="DashboardNurse">
          {() => (
            <ProtectedRoute>
              <DashboardNurse />
            </ProtectedRoute>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
