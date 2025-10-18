import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiService } from '@/services/api';
import type { CareTeamMember, Patient } from '@/types/medical';
import { UserPlus, UserMinus, Users, AlertCircle } from 'lucide-react';

interface ManageCareTeamProps {
  patient: Patient;
  onUpdate: () => void;
}

export function ManageCareTeam({ patient, onUpdate }: ManageCareTeamProps) {
  const [careTeam, setCareTeam] = useState<CareTeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [newMember, setNewMember] = useState({
    userId: '',
    name: '',
    role: '',
  });

  useEffect(() => {
    loadCareTeam();
  }, [patient.id]);

  const loadCareTeam = async () => {
    try {
      const team = await apiService.careTeam.getByPatient(patient.id);
      setCareTeam(team.filter(m => m.status === 'active'));
    } catch (err) {
      console.error('Error al cargar equipo:', err);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newMember.userId || !newMember.name || !newMember.role) {
      setError('Todos los campos son requeridos');
      return;
    }

    setLoading(true);
    try {
      await apiService.careTeam.addToPatient(
        patient.id,
        newMember.userId,
        newMember.name,
        newMember.role
      );

      setSuccess('Miembro agregado exitosamente');
      setNewMember({ userId: '', name: '', role: '' });
      setShowAddForm(false);
      await loadCareTeam();
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al agregar miembro');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('¿Estás seguro de remover este miembro del equipo?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiService.careTeam.removeFromPatient(patient.id, userId);
      setSuccess('Miembro removido exitosamente');
      await loadCareTeam();
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al remover miembro');
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      oncologo_principal: 'Oncólogo Principal',
      cirujano: 'Cirujano',
      radiologo: 'Radiólogo',
      enfermera_jefe: 'Enfermera Jefe',
      consultor: 'Consultor',
    };
    return labels[role] || role;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Equipo de Cuidados</span>
          </CardTitle>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Agregar Miembro
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mensajes */}
        {error && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800 text-sm ml-2">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800 text-sm">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Formulario para agregar miembro */}
        {showAddForm && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <form onSubmit={handleAddMember} className="space-y-3">
                <div>
                  <Label htmlFor="userId">ID del Usuario</Label>
                  <Input
                    id="userId"
                    value={newMember.userId}
                    onChange={(e) =>
                      setNewMember({ ...newMember, userId: e.target.value })
                    }
                    placeholder="UUID del usuario"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    value={newMember.name}
                    onChange={(e) =>
                      setNewMember({ ...newMember, name: e.target.value })
                    }
                    placeholder="Dr. Juan Pérez"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="role">Rol en el Equipo</Label>
                  <Select
                    value={newMember.role}
                    onValueChange={(value) =>
                      setNewMember({ ...newMember, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oncologo_principal">
                        Oncólogo Principal
                      </SelectItem>
                      <SelectItem value="cirujano">Cirujano</SelectItem>
                      <SelectItem value="radiologo">Radiólogo</SelectItem>
                      <SelectItem value="enfermera_jefe">
                        Enfermera Jefe
                      </SelectItem>
                      <SelectItem value="consultor">Consultor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? 'Agregando...' : 'Agregar'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista de miembros */}
        <div className="space-y-2">
          {careTeam.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay miembros en el equipo de cuidados
            </p>
          ) : (
            careTeam.map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-500">
                    {getRoleLabel(member.role)}
                  </p>
                  <p className="text-xs text-gray-400">
                    Asignado: {new Date(member.assignedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveMember(member.userId)}
                  disabled={loading}
                  className="text-red-600 hover:bg-red-50"
                >
                  <UserMinus className="w-4 h-4 mr-2" />
                  Remover
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
