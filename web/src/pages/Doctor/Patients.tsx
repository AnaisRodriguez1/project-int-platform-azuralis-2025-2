import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  User, 
  Calendar, 
  Heart, 
  Pill, 
  FileText, 
  Search,
  AlertCircle,
  Activity,
  Scissors
} from 'lucide-react';
import type { Patient } from '@/types/medical';
import { cancerColors } from '@/types/medical';

export function PatientsDoctor() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'todos' | 'estadio1-2' | 'estadio3-4'>('todos');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar pacientes del doctor
  useEffect(() => {
    const loadPatients = async () => {
      if (!user || user.role !== 'doctor') return;
      
      try {
        setIsLoading(true);
        const allPatients = await apiService.patients.getAll();
        // Filtrar pacientes donde este doctor está en el careTeam
        const myPatients = allPatients.filter((patient: any) => 
          patient.careTeam?.some((member: any) => member.userId === user.id)
        );
        setPatients(myPatients);
      } catch (error) {
        console.error('Error al cargar pacientes:', error);
        setPatients([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPatients();
  }, [user]);

  // Filtrar pacientes por búsqueda
  const filteredPatients = useMemo(() => {
    return patients.filter((patient: Patient) => {
      // Búsqueda por nombre, RUT o tipo de cáncer
      const searchLower = searchTerm.toLowerCase();
      const cancerColor = cancerColors[patient.cancerType];
      
      const matchesSearch = searchTerm === '' ||
                           patient.name.toLowerCase().includes(searchLower) ||
                           patient.rut.toLowerCase().includes(searchLower) ||
                           patient.cancerType.toLowerCase().includes(searchLower) ||
                           cancerColor.name.toLowerCase().includes(searchLower);
      
      // Filtrar por estadio
      const stage = patient.stage.toLowerCase();
      const isEarlyStage = stage.includes('i') && !stage.includes('iii') && !stage.includes('iv');
      const isLateStage = stage.includes('iii') || stage.includes('iv');
      
      const matchesFilter = selectedFilter === 'todos' || 
                           (selectedFilter === 'estadio1-2' && isEarlyStage) ||
                           (selectedFilter === 'estadio3-4' && isLateStage);
      
      return matchesSearch && matchesFilter;
    });
  }, [patients, searchTerm, selectedFilter]);

  // Obtener estadísticas
  const stats = useMemo(() => {
    const estadios12 = patients.filter((p: Patient) => {
      const stage = p.stage.toLowerCase();
      return stage.includes('i') && !stage.includes('iii') && !stage.includes('iv');
    }).length;
    
    const estadios34 = patients.filter((p: Patient) => {
      const stage = p.stage.toLowerCase();
      return stage.includes('iii') || stage.includes('iv');
    }).length;
    
    return {
      total: patients.length,
      estadios12,
      estadios34,
      conAlergias: patients.filter((p: Patient) => p.allergies && p.allergies.length > 0).length
    };
  }, [patients]);

  if (isLoading) {
    return (
      <div className="mt-8 text-center py-12">
        <p className="text-gray-600">Cargando pacientes...</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Header con estadísticas */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Mis Pacientes
        </h2>
        
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-medium">Total</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
                <User className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 font-medium">Estadio I-II</p>
                  <p className="text-2xl font-bold text-green-900">{stats.estadios12}</p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-600 font-medium">Estadio III-IV</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.estadios34}</p>
                </div>
                <Heart className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-600 font-medium">Con Alergias</p>
                  <p className="text-2xl font-bold text-red-900">{stats.conAlergias}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar por nombre, RUT o tipo de cáncer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedFilter === 'todos' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('todos')}
              size="sm"
            >
              Todos ({stats.total})
            </Button>
            <Button
              variant={selectedFilter === 'estadio1-2' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('estadio1-2')}
              size="sm"
            >
              Estadio I-II ({stats.estadios12})
            </Button>
            <Button
              variant={selectedFilter === 'estadio3-4' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('estadio3-4')}
              size="sm"
            >
              Estadio III-IV ({stats.estadios34})
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de pacientes */}
      {filteredPatients.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No se encontraron pacientes con ese criterio de búsqueda' : 'No tienes pacientes asignados'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPatients.map((patient: Patient) => {
            const cancerColor = cancerColors[patient.cancerType];
            
            return (
              <Card key={patient.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={patient.photo} alt={patient.name} />
                        <AvatarFallback 
                          style={{ backgroundColor: cancerColor.color }}
                          className="text-white font-semibold"
                        >
                          {patient.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{patient.name}</CardTitle>
                        <p className="text-sm text-gray-500">{patient.rut}</p>
                      </div>
                    </div>
                    <Badge 
                      style={{ 
                        backgroundColor: cancerColor.color,
                        color: 'white'
                      }}
                    >
                      {cancerColor.name}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Información básica */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{patient.age} años</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">ID: {patient.id}</span>
                    </div>
                  </div>

                  {/* Estado del tratamiento */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {patient.stage}
                      </span>
                    </div>
                    <Badge 
                      variant={(() => {
                        const stage = patient.stage.toLowerCase();
                        const isEarly = stage.includes('i') && !stage.includes('iii') && !stage.includes('iv');
                        return isEarly ? 'default' : 'secondary';
                      })()}
                      style={{
                        backgroundColor: (() => {
                          const stage = patient.stage.toLowerCase();
                          const isEarly = stage.includes('i') && !stage.includes('iii') && !stage.includes('iv');
                          return isEarly ? '#10b981' : '#f97316';
                        })()
                      }}
                    >
                      {patient.stage}
                    </Badge>
                  </div>

                  {/* Información médica importante */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {patient.allergies && patient.allergies.length > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {patient.allergies.length} {patient.allergies.length === 1 ? 'Alergia' : 'Alergias'}
                      </Badge>
                    )}
                    {patient.currentMedications && patient.currentMedications.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <Pill className="w-3 h-3 mr-1" />
                        {patient.currentMedications.length} {patient.currentMedications.length === 1 ? 'Medicamento' : 'Medicamentos'}
                      </Badge>
                    )}
                    {patient.operations && patient.operations.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <Scissors className="w-3 h-3 mr-1" />
                        {patient.operations.length} {patient.operations.length === 1 ? 'Cirugía' : 'Cirugías'}
                      </Badge>
                    )}
                  </div>

                  {/* Diagnóstico */}
                  {patient.diagnosis && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Diagnóstico</p>
                      <p className="text-sm text-gray-900 line-clamp-2">{patient.diagnosis}</p>
                    </div>
                  )}

                  {/* Resumen de tratamiento */}
                  {patient.treatmentSummary && (
                    <div className="pt-2 bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-blue-600 font-medium mb-1">Tratamiento</p>
                      <p className="text-xs text-blue-900 line-clamp-2">{patient.treatmentSummary}</p>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => alert(`Contactos de emergencia:\n${patient.emergencyContacts.map((c: any) => `${c.name} (${c.relationship}): ${c.phone}`).join('\n')}`)}
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Contactos
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      style={{ backgroundColor: cancerColor.color }}
                      onClick={() => alert(`Ver ficha completa de ${patient.name}`)}
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Ver Ficha
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
