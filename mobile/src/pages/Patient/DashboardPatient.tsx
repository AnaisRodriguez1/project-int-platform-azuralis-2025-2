import React, { useState } from 'react';
import {View, Text,TouchableOpacity,StyleSheet, SafeAreaView,ScrollView,Alert,} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import HomePatient from '../../pages/Patient/Home';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Pantallas hijas 
import NotesPatient from '../../pages/Patient/Notes';
import DocumentsPatient from '../../pages/Patient/Documents';
import ProfilePatient from '../../pages/Patient/Profile';

export default function DashboardPatient() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'home' | 'notes' | 'documents' | 'profile'>('home');

  const handleLogout = async () => {
    await AsyncStorage.removeItem(`patientProfile_${user?.id}`);
    logout();
    navigation.navigate('Login');
  };

 
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePatient />;
      case 'notes':
        return <NotesPatient />;
      case 'documents':
        return <DocumentsPatient />; 
      case 'profile':
        return <ProfilePatient />;
      default:
        return null;
    }
  };

  // Barra inferior simple tipo BottomNavigation
  const renderBottomNavigation = () => (
    <View style={styles.bottomNav}>
      {[
        { id: 'home', label: 'Inicio' },
        { id: 'notes', label: 'Notas' },
        { id: 'documents', label: 'Docs' },
        { id: 'profile', label: 'Perfil' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tabButton, activeTab === tab.id && styles.tabActive]}
          onPress={() => setActiveTab(tab.id as any)}
        >
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === tab.id ? '#fa8fb5' : '#555' },
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Mi Ficha Médica</Text>
          <Text style={styles.subtitle}>Bienvenido/a, {user?.name}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Contenido dinámico */}
      <ScrollView style={{ flex: 1 }}>{renderContent()}</ScrollView>

      {/* Navegación inferior */}
      {renderBottomNavigation()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  subtitle: { color: '#555', fontSize: 14 },
  logoutButton: {
    borderColor: '#fa8fb5',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  logoutText: {
    color: '#fa8fb5',
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  tabButton: {
    alignItems: 'center',
    paddingVertical: 6,
    flex: 1,
  },
  tabActive: {
    borderTopWidth: 3,
    borderTopColor: '#fa8fb5',
  },
  tabLabel: { fontSize: 14, fontWeight: '500' },
});
