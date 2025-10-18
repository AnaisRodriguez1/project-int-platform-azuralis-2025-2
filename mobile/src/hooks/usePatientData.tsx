import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePatientContext } from '../context/PatientContext';
import { cancerColorsExtended as cancerColors } from '../types/medical';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PatientData {
  cancerType: keyof typeof cancerColors;
  cancerColor: { color: string; name: string };
  patientId: string;
  patientName: string;
}

export function usePatientData(): PatientData {
  const { user } = useAuth();
  const { currentPatient } = usePatientContext();

  const [patientData, setPatientData] = useState<PatientData>({
    cancerType: 'other',
    cancerColor: cancerColors.other,
    patientId: '',
    patientName: 'Cargando...',
  });

  useEffect(() => {
    const loadPatientData = async () => {
      try {
        if (user?.role === 'patient') {
          const storedProfile = await AsyncStorage.getItem(`patientProfile_${user.id}`);
          if (storedProfile) {
            const profile = JSON.parse(storedProfile);
            setPatientData({
              patientId: profile.id || user.id,
              patientName: profile.name || user.name,
              cancerType: profile.cancerType || 'other',
              cancerColor: cancerColors[profile.cancerType as keyof typeof cancerColors] || cancerColors.other,

            });
          } else {
            setPatientData({
              patientId: user.id,
              patientName: user.name,
              cancerType: 'other',
              cancerColor: cancerColors.other,
            });
          }
        } else if (
          user?.role === 'guardian' ||
          user?.role === 'doctor' ||
          user?.role === 'nurse'
        ) {
          if (currentPatient) {
            setPatientData({
              patientId: currentPatient.patientId,
              patientName: currentPatient.name,
              cancerType: currentPatient.cancerType,
              cancerColor:
                cancerColors[currentPatient.cancerType] || cancerColors.other,
            });
          } else {
            setPatientData({
              patientId: '',
              patientName: 'No seleccionado',
              cancerType: 'other',
              cancerColor: cancerColors.other,
            });
          }
        }
      } catch (error) {
        console.error('Error al cargar datos del paciente:', error);
        setPatientData({
          patientId: '',
          patientName: user?.name || '',
          cancerType: 'other',
          cancerColor: cancerColors.other,
        });
      }
    };

    loadPatientData();
  }, [user, currentPatient]);

  return patientData;
}
