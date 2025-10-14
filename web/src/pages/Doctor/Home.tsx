import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getPatientsByDoctor } from '@/services/mockApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Calendar, 
  Activity, 
  TrendingUp,
  AlertCircle,
  Clock,
  Heart,
  CheckCircle,
  Bell,
  FileText
} from 'lucide-react';
import type { DoctorUser } from '@/types/medical';
import { cancerColors } from '@/types/medical';

export function HomeDoctor() {
  const { user } = useAuth();

  // Obtener pacientes del doctor
  const patients = useMemo(() => {
    if (user?.role === 'doctor') {
      const doctorUser = user as DoctorUser;
      return getPatientsByDoctor(doctorUser.name);
    }
    return [];
  }, [user]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = patients.length;
    const conAlergias = patients.filter(p => p.allergies && p.allergies.length > 0).length;
    const estadiosTempranos = patients.filter(p => p.stage.includes('I') || p.stage.includes('II')).length;
    const estadiosAvanzados = patients.filter(p => p.stage.includes('III') || p.stage.includes('IV')).length;
    
    // Distribución por tipo de cáncer
    const cancerDistribution: { [key: string]: number } = {};
    patients.forEach(p => {
      cancerDistribution[p.cancerType] = (cancerDistribution[p.cancerType] || 0) + 1;
    });

    return {
      total,
      conAlergias,
      estadiosTempranos,
      estadiosAvanzados,
      cancerDistribution
    };
  }, [patients]);

  // Pacientes recientes (últimos 3)
  const recentPatients = useMemo(() => {
    return patients.slice(0, 3);
  }, [patients]);

  // Obtener fecha y hora actual
  const currentDate = new Date().toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const currentTime = new Date().toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="mt-4 md:mt-8 space-y-4 md:space-y-6 pb-4">
      {/* Header con fecha */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Bienvenido, Dr./Dra. {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            {currentDate} • {currentTime}
          </p>
        </div>
        <Badge variant="outline" className="h-8 px-4 w-fit">
          <Activity className="w-4 h-4 mr-2" />
          En línea
        </Badge>
      </div>

      {/* Tarjetas de estadísticas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-blue-600 font-medium mb-1">Total</p>
                <p className="text-2xl md:text-3xl font-bold text-blue-900">{stats.total}</p>
                <p className="text-[10px] md:text-xs text-blue-600 mt-1 hidden sm:block">Bajo mi cuidado</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-200 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-green-600 font-medium mb-1">Temprano</p>
                <p className="text-2xl md:text-3xl font-bold text-green-900">{stats.estadiosTempranos}</p>
                <p className="text-[10px] md:text-xs text-green-600 mt-1">I-II</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-200 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-orange-600 font-medium mb-1">Avanzado</p>
                <p className="text-2xl md:text-3xl font-bold text-orange-900">{stats.estadiosAvanzados}</p>
                <p className="text-[10px] md:text-xs text-orange-600 mt-1">III-IV</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-200 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-red-600 font-medium mb-1">Alergias</p>
                <p className="text-2xl md:text-3xl font-bold text-red-900">{stats.conAlergias}</p>
                <p className="text-[10px] md:text-xs text-red-600 mt-1 hidden sm:block">Precaución</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-red-200 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sección de dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Columna izquierda - Actividades del día */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Agenda del día */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 md:p-6">
              <CardTitle className="text-white flex items-center text-base md:text-lg">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Agenda de Hoy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-start space-x-3 md:space-x-4 p-3 md:p-4 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h4 className="font-semibold text-sm md:text-base text-gray-900">Consultas Programadas</h4>
                      <Badge className="bg-blue-500 w-fit">8 pacientes</Badge>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">08:00 - 16:00</p>
                    <div className="mt-2 flex flex-wrap gap-1.5 md:gap-2">
                      <Badge variant="outline" className="text-[10px] md:text-xs">Mama: 3</Badge>
                      <Badge variant="outline" className="text-[10px] md:text-xs">Próstata: 2</Badge>
                      <Badge variant="outline" className="text-[10px] md:text-xs">Gástrico: 2</Badge>
                      <Badge variant="outline" className="text-[10px] md:text-xs">Otros: 1</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 md:space-x-4 p-3 md:p-4 bg-purple-50 rounded-lg">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h4 className="font-semibold text-sm md:text-base text-gray-900">Revisión de Exámenes</h4>
                      <Badge className="bg-purple-500 w-fit">5 pendientes</Badge>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">Resultados de laboratorio e imágenes</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 md:space-x-4 p-3 md:p-4 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h4 className="font-semibold text-sm md:text-base text-gray-900">Seguimientos</h4>
                      <Badge className="bg-green-500 w-fit">3 pacientes</Badge>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">Control post-tratamiento</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distribución por tipo de cáncer */}
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center text-base md:text-lg">
                <Activity className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Distribución de Casos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
              <div className="space-y-3 md:space-y-4">
                {Object.entries(stats.cancerDistribution)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => {
                    const color = cancerColors[type as keyof typeof cancerColors];
                    const percentage = ((count / stats.total) * 100).toFixed(0);
                    
                    return (
                      <div key={type} className="space-y-1.5 md:space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: color.color }}
                            />
                            <span className="text-xs md:text-sm font-medium truncate">{color.name}</span>
                          </div>
                          <span className="text-xs md:text-sm text-gray-600 ml-2 flex-shrink-0">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
                          <div
                            className="h-1.5 md:h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: color.color
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha - Pacientes recientes y notificaciones */}
        <div className="space-y-4 md:space-y-6">
          {/* Pacientes Recientes */}
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center justify-between text-base md:text-lg">
                <span className="flex items-center">
                  <Users className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Pacientes Recientes
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
              <div className="space-y-3 md:space-y-4">
                {recentPatients.length === 0 ? (
                  <p className="text-xs md:text-sm text-gray-500 text-center py-4">
                    No hay pacientes asignados
                  </p>
                ) : (
                  recentPatients.map((patient) => {
                    const color = cancerColors[patient.cancerType];
                    return (
                      <div key={patient.id} className="flex items-center space-x-3 p-2 md:p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                        <Avatar className="w-9 h-9 md:w-10 md:h-10 flex-shrink-0">
                          <AvatarImage src={patient.photo} alt={patient.name} />
                          <AvatarFallback style={{ backgroundColor: color.color }} className="text-white text-xs md:text-sm">
                            {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-medium text-gray-900 truncate">
                            {patient.name}
                          </p>
                          <p className="text-[10px] md:text-xs text-gray-500">
                            {color.name} • {patient.stage}
                          </p>
                        </div>
                        {patient.allergies && patient.allergies.length > 0 && (
                          <AlertCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notificaciones */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 md:p-6">
              <CardTitle className="text-white flex items-center text-base md:text-lg">
                <Bell className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-2.5 md:space-y-3">
                <div className="p-2.5 md:p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <p className="text-xs md:text-sm font-medium text-yellow-900">Resultados pendientes</p>
                  <p className="text-[10px] md:text-xs text-yellow-700 mt-1">5 exámenes requieren revisión</p>
                </div>
                <div className="p-2.5 md:p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <p className="text-xs md:text-sm font-medium text-blue-900">Próximas citas</p>
                  <p className="text-[10px] md:text-xs text-blue-700 mt-1">8 consultas programadas hoy</p>
                </div>
                <div className="p-2.5 md:p-3 bg-green-50 border-l-4 border-green-400 rounded">
                  <p className="text-xs md:text-sm font-medium text-green-900">Seguimientos</p>
                  <p className="text-[10px] md:text-xs text-green-700 mt-1">3 pacientes en control</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acceso rápido */}
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-sm md:text-base">Acceso Rápido</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
              <div className="grid grid-cols-2 gap-2">
                <button className="p-2.5 md:p-3 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 rounded-lg text-center transition-colors">
                  <FileText className="w-4 h-4 md:w-5 md:h-5 text-blue-600 mx-auto mb-1" />
                  <span className="text-[10px] md:text-xs font-medium text-blue-900">Recetas</span>
                </button>
                <button className="p-2.5 md:p-3 bg-purple-50 hover:bg-purple-100 active:bg-purple-200 rounded-lg text-center transition-colors">
                  <Activity className="w-4 h-4 md:w-5 md:h-5 text-purple-600 mx-auto mb-1" />
                  <span className="text-[10px] md:text-xs font-medium text-purple-900">Exámenes</span>
                </button>
                <button className="p-2.5 md:p-3 bg-green-50 hover:bg-green-100 active:bg-green-200 rounded-lg text-center transition-colors">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-green-600 mx-auto mb-1" />
                  <span className="text-[10px] md:text-xs font-medium text-green-900">Agenda</span>
                </button>
                <button className="p-2.5 md:p-3 bg-orange-50 hover:bg-orange-100 active:bg-orange-200 rounded-lg text-center transition-colors">
                  <Users className="w-4 h-4 md:w-5 md:h-5 text-orange-600 mx-auto mb-1" />
                  <span className="text-[10px] md:text-xs font-medium text-orange-900">Pacientes</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
