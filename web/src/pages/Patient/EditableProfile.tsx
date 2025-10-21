import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePatientData } from '@/hooks/usePatientData';
import { apiService } from '@/services/api';
import { cancerColors, PATIENT_PERMISSIONS } from '@/types/medical';
import type { Patient, EmergencyContact, Operation } from '@/types/medical';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { ImageCropDialog } from '@/components/ui/image-crop-dialog';
import { 
  User, 
  Palette, 
  Lock, 
  LogOut, 
  Edit3, 
  Save, 
  AlertCircle, 
  Phone, 
  Pill, 
  Scissors,
  Plus,
  Trash2,
  X
} from 'lucide-react';

export function EditableProfile() {
  const { user, logout } = useAuth();
  const { patientId } = usePatientData();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [userPhoto, setUserPhoto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de edición
  const [editingName, setEditingName] = useState(false);
  const [editingMeds, setEditingMeds] = useState(false);
  const [editingAllergies, setEditingAllergies] = useState(false);
  const [editingContacts, setEditingContacts] = useState(false);
  const [editingOperations, setEditingOperations] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState(false);
  
  // Estados temporales
  const [tempName, setTempName] = useState('');
  const [tempMeds, setTempMeds] = useState<string[]>([]);
  const [tempAllergies, setTempAllergies] = useState<string[]>([]);
  const [tempContacts, setTempContacts] = useState<EmergencyContact[]>([]);
  const [tempOperations, setTempOperations] = useState<Operation[]>([]);
  const [tempTreatment, setTempTreatment] = useState('');

  // Cargar datos del paciente
  useEffect(() => {
    const loadData = async () => {
      if (patientId) {
        try {
          setLoading(true);
          const patientData = await apiService.patients.getOne(patientId);
          setPatient(patientData);
          
          // Cargar foto de perfil del usuario
          if (user?.id) {
            try {
              const photoData = await apiService.users.getProfilePicture(user.id);
              setUserPhoto(photoData);
            } catch (error) {
              console.log('No profile picture found');
            }
          }
        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();
  }, [patientId, user?.id]);

  // Función para verificar si puede editar un campo
  const canEdit = (field: keyof Patient): boolean => {
    return PATIENT_PERMISSIONS.patientProfile?.editableFields.has(field) || false;
  };

  // Función para guardar cambios
  const saveField = async (field: keyof Patient, value: any) => {
    if (!patient) return false;
    
    try {
      setSaving(true);
      const updatedPatient = await apiService.patients.update(patient.id, {
        [field]: value
      });
      setPatient(updatedPatient);
      alert('✅ Cambios guardados correctamente');
      return true;
    } catch (error) {
      console.error('Error saving field:', error);
      alert('❌ Error al guardar. Intenta nuevamente.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ==== NOMBRE ====
  const startEditingName = () => {
    if (!patient) return;
    setTempName(patient.name);
    setEditingName(true);
  };

  const saveName = async () => {
    if (await saveField('name', tempName)) {
      setEditingName(false);
    }
  };

  // ==== MEDICAMENTOS ====
  const startEditingMeds = () => {
    if (!patient) return;
    setTempMeds([...patient.currentMedications]);
    setEditingMeds(true);
  };

  const saveMeds = async () => {
    if (await saveField('currentMedications', tempMeds)) {
      setEditingMeds(false);
    }
  };

  const addMed = () => setTempMeds([...tempMeds, '']);
  const removeMed = (index: number) => setTempMeds(tempMeds.filter((_, i) => i !== index));
  const updateMed = (index: number, value: string) => {
    const newMeds = [...tempMeds];
    newMeds[index] = value;
    setTempMeds(newMeds);
  };

  // ==== ALERGIAS ====
  const startEditingAllergies = () => {
    if (!patient) return;
    setTempAllergies([...patient.allergies]);
    setEditingAllergies(true);
  };

  const saveAllergies = async () => {
    if (await saveField('allergies', tempAllergies)) {
      setEditingAllergies(false);
    }
  };

  const addAllergy = () => setTempAllergies([...tempAllergies, '']);
  const removeAllergy = (index: number) => setTempAllergies(tempAllergies.filter((_, i) => i !== index));
  const updateAllergy = (index: number, value: string) => {
    const newAllergies = [...tempAllergies];
    newAllergies[index] = value;
    setTempAllergies(newAllergies);
  };

  // ==== CONTACTOS ====
  const startEditingContacts = () => {
    if (!patient) return;
    setTempContacts([...patient.emergencyContacts]);
    setEditingContacts(true);
  };

  const saveContacts = async () => {
    if (await saveField('emergencyContacts', tempContacts)) {
      setEditingContacts(false);
    }
  };

  const addContact = () => setTempContacts([...tempContacts, { name: '', relationship: '', phone: '' }]);
  const removeContact = (index: number) => setTempContacts(tempContacts.filter((_, i) => i !== index));
  const updateContact = (index: number, field: keyof EmergencyContact, value: string) => {
    const newContacts = [...tempContacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setTempContacts(newContacts);
  };

  // ==== OPERACIONES ====
  const startEditingOperations = () => {
    if (!patient) return;
    setTempOperations([...patient.operations]);
    setEditingOperations(true);
  };

  const saveOperations = async () => {
    if (await saveField('operations', tempOperations)) {
      setEditingOperations(false);
    }
  };

  const addOperation = () => setTempOperations([...tempOperations, { date: '', procedure: '', hospital: '' }]);
  const removeOperation = (index: number) => setTempOperations(tempOperations.filter((_, i) => i !== index));
  const updateOperation = (index: number, field: keyof Operation, value: string) => {
    const newOps = [...tempOperations];
    newOps[index] = { ...newOps[index], [field]: value };
    setTempOperations(newOps);
  };

  // ==== TRATAMIENTO ====
  const startEditingTreatment = () => {
    if (!patient) return;
    setTempTreatment(patient.treatmentSummary);
    setEditingTreatment(true);
  };

  const saveTreatment = async () => {
    if (await saveField('treatmentSummary', tempTreatment)) {
      setEditingTreatment(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    if (!user) return;

    try {
      setSaving(true);
      // Convertir el blob a File
      const croppedFile = new File([croppedImageBlob], 'profile-picture.jpg', {
        type: 'image/jpeg',
      });

      const result = await apiService.users.uploadProfilePicture(user.id, croppedFile);
      setUserPhoto(result);
      alert('✅ Foto de perfil actualizada correctamente');

      // Limpiar el estado
      setSelectedImageSrc(null);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('❌ Error al subir la foto. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="mt-8 text-center">
        <p className="text-gray-500">Cargando datos del paciente...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="mt-8 text-center">
        <p className="text-gray-500">No se pudo cargar la información del paciente</p>
      </div>
    );
  }

  const currentCancerColor = cancerColors[patient.cancerType];

  return (
    <div className="mt-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mi Ficha Médica</h2>
        <p className="text-gray-600">Información médica y datos personales</p>
      </div>

      {/* Datos Personales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" style={{ color: currentCancerColor.color }} />
            <span>Datos Personales</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="space-y-2">
              <Avatar className="w-20 h-20">
                <AvatarImage src={userPhoto?.url} alt={patient?.name} />
                <AvatarFallback className="text-lg" style={{ backgroundColor: currentCancerColor.color + '40' }}>
                  {patient?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    console.log('Button clicked, triggering file input');
                    fileInputRef.current?.click();
                  }}
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  Cambiar Foto
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    console.log('handlePhotoUpload called', e.target.files);
                    const file = e.target.files?.[0];
                    if (!file) {
                      console.log('No file selected');
                      return;
                    }

                    console.log('File selected:', file.name, file.size);

                    // Limpiar el input ANTES de procesar para evitar problemas
                    e.target.value = '';

                    // Crear URL para mostrar en el diálogo de recorte
                    const imageUrl = URL.createObjectURL(file);
                    console.log('Image URL created:', imageUrl);
                    setSelectedImageSrc(imageUrl);
                    setCropDialogOpen(true);
                  }}
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">

              {/* Nombre */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-sm text-gray-600">Nombre completo</Label>
                  {canEdit('name') && !editingName && (
                    <Button size="sm" variant="ghost" onClick={startEditingName}>
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {editingName ? (
                  <div className="space-y-2">
                    <Input
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      placeholder="Nombre completo"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveName} disabled={saving}>
                        <Save className="w-3 h-3 mr-1" />
                        Guardar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingName(false)}>
                        <X className="w-3 h-3 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="font-medium">{patient.name}</p>
                )}
              </div>

              <div>
                <Label className="text-sm text-gray-600">Edad</Label>
                <p className="font-medium">{patient.age} años</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">RUT</Label>
                <p className="font-medium">{patient.rut}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Correo electrónico</Label>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información Médica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" style={{ color: currentCancerColor.color }} />
            <span>Información Médica</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm text-gray-600">Diagnóstico</Label>
            <p className="font-medium">{patient.diagnosis}</p>
            <Badge className="mt-1" style={{ backgroundColor: currentCancerColor.color }}>
              Estadio {patient.stage}
            </Badge>
          </div>
          <div>
            <Label className="text-sm text-gray-600">Tipo de cáncer</Label>
            <div className="flex items-center space-x-2 mt-1">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: currentCancerColor.color }}
              />
              <span className="font-medium">{currentCancerColor.name}</span>
            </div>
          </div>
          <div>
            <Label className="text-sm text-gray-600">Médico tratante</Label>
            <p className="font-medium">{patient.careTeam?.[0]?.name || 'No asignado'}</p>
          </div>
          <div>
            <Label className="text-sm text-gray-600">ID de ficha médica</Label>
            <p className="font-medium font-mono text-sm bg-gray-100 p-2 rounded">
              {patient.qrCode}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Tratamiento */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" style={{ color: currentCancerColor.color }} />
              <span>Resumen de Tratamiento</span>
            </CardTitle>
            {canEdit('treatmentSummary') && !editingTreatment && (
              <Button size="sm" variant="ghost" onClick={startEditingTreatment}>
                <Edit3 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingTreatment ? (
            <div className="space-y-3">
              <Textarea
                value={tempTreatment}
                onChange={(e) => setTempTreatment(e.target.value)}
                placeholder="Resumen del tratamiento"
                rows={4}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={saveTreatment} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingTreatment(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700">{patient.treatmentSummary}</p>
          )}
        </CardContent>
      </Card>

      {/* Alergias */}
      <Card className="border-red-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>Alergias</span>
            </CardTitle>
            {canEdit('allergies') && !editingAllergies && (
              <Button size="sm" variant="ghost" onClick={startEditingAllergies}>
                <Edit3 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingAllergies ? (
            <div className="space-y-3">
              {tempAllergies.map((allergy, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={allergy}
                    onChange={(e) => updateAllergy(index, e.target.value)}
                    placeholder="Nombre de la alergia"
                    className="flex-1"
                  />
                  <Button size="sm" variant="ghost" onClick={() => removeAllergy(index)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={addAllergy} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Alergia
              </Button>
              <div className="flex gap-2 mt-4">
                <Button size="sm" onClick={saveAllergies} disabled={saving} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingAllergies(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : patient.allergies.length > 0 ? (
            <ul className="space-y-2">
              {patient.allergies.map((allergy, index) => (
                <li key={index} className="text-sm bg-red-50 p-3 rounded-lg text-red-800 font-medium">
                  ⚠️ {allergy}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Sin alergias registradas</p>
          )}
        </CardContent>
      </Card>

      {/* Medicamentos Actuales */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Pill className="w-5 h-5" style={{ color: currentCancerColor.color }} />
              <span>Medicamentos Actuales</span>
            </CardTitle>
            {canEdit('currentMedications') && !editingMeds && (
              <Button size="sm" variant="ghost" onClick={startEditingMeds}>
                <Edit3 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingMeds ? (
            <div className="space-y-3">
              {tempMeds.map((med, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={med}
                    onChange={(e) => updateMed(index, e.target.value)}
                    placeholder="Nombre del medicamento"
                    className="flex-1"
                  />
                  <Button size="sm" variant="ghost" onClick={() => removeMed(index)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={addMed} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Medicamento
              </Button>
              <div className="flex gap-2 mt-4">
                <Button size="sm" onClick={saveMeds} disabled={saving} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingMeds(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : patient.currentMedications.length > 0 ? (
            <ul className="space-y-2">
              {patient.currentMedications.map((medication, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div
                    className="w-2 h-2 rounded-full mt-1.5"
                    style={{ backgroundColor: currentCancerColor.color }}
                  />
                  <span className="text-sm text-gray-700">{medication}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Sin medicamentos registrados</p>
          )}
        </CardContent>
      </Card>

      {/* Contactos de Emergencia */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Phone className="w-5 h-5" style={{ color: currentCancerColor.color }} />
              <span>Contactos de Emergencia</span>
            </CardTitle>
            {canEdit('emergencyContacts') && !editingContacts && (
              <Button size="sm" variant="ghost" onClick={startEditingContacts}>
                <Edit3 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingContacts ? (
            <div className="space-y-3">
              {tempContacts.map((contact, index) => (
                <div key={index} className="p-3 border rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-600">Contacto {index + 1}</span>
                    <Button size="sm" variant="ghost" onClick={() => removeContact(index)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                  <Input
                    value={contact.name}
                    onChange={(e) => updateContact(index, 'name', e.target.value)}
                    placeholder="Nombre"
                  />
                  <Input
                    value={contact.relationship}
                    onChange={(e) => updateContact(index, 'relationship', e.target.value)}
                    placeholder="Relación (ej: Madre, Esposo)"
                  />
                  <Input
                    value={contact.phone}
                    onChange={(e) => updateContact(index, 'phone', e.target.value)}
                    placeholder="Teléfono"
                  />
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={addContact} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Contacto
              </Button>
              <div className="flex gap-2 mt-4">
                <Button size="sm" onClick={saveContacts} disabled={saving} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingContacts(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : patient.emergencyContacts.length > 0 ? (
            <div className="space-y-4">
              {patient.emergencyContacts.map((contact, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-sm text-gray-600">{contact.relationship}</p>
                  <p className="text-sm text-gray-700 mt-1">
                    <a href={`tel:${contact.phone}`} className="hover:underline">
                      {contact.phone}
                    </a>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Sin contactos de emergencia registrados</p>
          )}
        </CardContent>
      </Card>

      {/* Operaciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Scissors className="w-5 h-5" style={{ color: currentCancerColor.color }} />
              <span>Historial de Cirugías</span>
            </CardTitle>
            {canEdit('operations') && !editingOperations && (
              <Button size="sm" variant="ghost" onClick={startEditingOperations}>
                <Edit3 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingOperations ? (
            <div className="space-y-3">
              {tempOperations.map((op, index) => (
                <div key={index} className="p-3 border rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-600">Operación {index + 1}</span>
                    <Button size="sm" variant="ghost" onClick={() => removeOperation(index)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                  <Input
                    value={op.procedure}
                    onChange={(e) => updateOperation(index, 'procedure', e.target.value)}
                    placeholder="Procedimiento"
                  />
                  <Input
                    type="date"
                    value={op.date}
                    onChange={(e) => updateOperation(index, 'date', e.target.value)}
                    placeholder="Fecha"
                  />
                  <Input
                    value={op.hospital}
                    onChange={(e) => updateOperation(index, 'hospital', e.target.value)}
                    placeholder="Hospital"
                  />
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={addOperation} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Operación
              </Button>
              <div className="flex gap-2 mt-4">
                <Button size="sm" onClick={saveOperations} disabled={saving} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingOperations(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : patient.operations.length > 0 ? (
            <div className="space-y-4">
              {patient.operations.map((operation, index) => (
                <div key={index} className="border-l-4 pl-4" style={{ borderColor: currentCancerColor.color }}>
                  <p className="font-medium">{operation.procedure}</p>
                  <p className="text-sm text-gray-600">{operation.hospital}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(operation.date)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Sin operaciones registradas</p>
          )}
        </CardContent>
      </Card>

      {/* Personalización de Color */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5" style={{ color: currentCancerColor.color }} />
            <span>Personalización</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Color de la aplicación basado en tu tipo de cáncer
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {Object.entries(cancerColors).map(([type, config]) => (
              <div
                key={type}
                className={`flex flex-col items-center p-3 rounded-lg border-2 ${
                  patient.cancerType === type 
                    ? 'border-gray-900 bg-gray-50' 
                    : 'border-gray-200'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full mb-2 shadow-sm"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-xs text-center leading-tight">
                  {config.name}
                </span>
                {patient.cancerType === type && (
                  <div className="mt-1">
                    <div className="w-2 h-2 bg-gray-900 rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: currentCancerColor.color + '20' }}>
            <p className="text-sm" style={{ color: currentCancerColor.color }}>
              <strong>Color actual:</strong> {currentCancerColor.name} - 
              Este color se aplica a los elementos destacados de tu aplicación.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Seguridad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="w-5 h-5" style={{ color: currentCancerColor.color }} />
            <span>Seguridad</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-gray-600">Contraseña</Label>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm">••••••••</p>
                <Button variant="outline" size="sm">
                  Cambiar contraseña
                </Button>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de recorte de imagen */}
      <ImageCropDialog
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        imageSrc={selectedImageSrc}
        onCropComplete={handleCropComplete}
        aspect={1} // Cuadrado
      />
    </div>
  );
}
