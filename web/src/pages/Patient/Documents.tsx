import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePatientData } from '@/hooks/usePatientData';
import {
  getDocumentsByPatientId,
  uploadDocument,
  deleteDocument as deleteDocumentApi,
  getUserById
} from '@/services/mockApi';
import { type PatientDocument, type DocumentType, getDocumentTypeColor, getDocumentTypeLabel } from '@/types/medical';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Calendar, Trash2, Eye, FolderOpen, Upload, Camera } from 'lucide-react';

interface DocumentsPatientProps {
  hideHeader?: boolean; // Prop para ocultar el header cuando se usa en un wrapper
}

export function DocumentsPatient({ hideHeader = false }: DocumentsPatientProps = {}) {
  const { user } = useAuth();
  const { patientId, cancerColor } = usePatientData();
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<PatientDocument[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<DocumentType | 'todos'>('todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState<DocumentType>('examen');
  const [newDocDescription, setNewDocDescription] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<PatientDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [patientId]);

  useEffect(() => {
    filterDocuments();
  }, [documents, selectedFilter]);

  const loadDocuments = () => {
    if (!patientId) return;
    const docs = getDocumentsByPatientId(patientId);
    setDocuments(docs);
  };

  const filterDocuments = () => {
    if (selectedFilter === 'todos') {
      setFilteredDocuments(documents);
    } else {
      setFilteredDocuments(documents.filter(doc => doc.type === selectedFilter));
    }
  };

  const getDocumentCountByType = (type: DocumentType | 'todos'): number => {
    if (type === 'todos') return documents.length;
    return documents.filter(doc => doc.type === type).length;
  };

  const handleAddDocument = async () => {
    if (!newDocTitle.trim() || !user || !patientId) return;

    setIsLoading(true);
    try {
      // Simular URL de documento (en producción sería una URL real del servidor)
      const mockUrl = `https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=400&fit=crop`;

      await uploadDocument({
        title: newDocTitle,
        type: newDocType,
        url: mockUrl,
        patientId: patientId,
        uploaderId: user.id,
        description: newDocDescription
      });

      loadDocuments();
      setNewDocTitle('');
      setNewDocType('examen');
      setNewDocDescription('');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error al subir documento:', error);
      alert('Error al subir el documento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('¿Estás seguro de eliminar este documento?')) return;

    setIsLoading(true);
    try {
      await deleteDocumentApi(docId);
      loadDocuments();
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      alert('Error al eliminar el documento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // En producción aquí subirías el archivo al servidor
    console.log('Archivo seleccionado:', file.name);
    setNewDocTitle(file.name.split('.')[0]);
  };

  const takePhoto = () => {
    // En producción aquí activarías la cámara del dispositivo
    console.log('Activar cámara');
    setNewDocTitle('Foto tomada ' + new Date().toLocaleTimeString());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Verificar si el usuario actual puede eliminar un documento
  const canDeleteDocument = (document: PatientDocument): boolean => {
    if (!user) return false;
    
    // El uploader siempre puede eliminar su propio documento
    if (document.uploaderId === user.id) return true;
    
    // Doctores y enfermeras pueden eliminar cualquier documento
    if (user.role === 'doctor' || user.role === 'nurse') return true;
    
    // Guardianes pueden eliminar documentos del paciente bajo su cuidado
    if (user.role === 'guardian') {
      return document.patientId === patientId;
    }
    
    // Pacientes pueden eliminar documentos relacionados con ellos (excepto los de doctor/enfermera)
    if (user.role === 'patient') {
      if (document.patientId === patientId) {
        // Verificar si el uploader es doctor o enfermera usando búsqueda O(1)
        const uploader = getUserById(document.uploaderId);
        if (uploader && (uploader.role === 'doctor' || uploader.role === 'nurse')) {
          return false;
        }
        return true;
      }
    }
    
    return false;
  };

  if (!patientId) {
    return (
      <div className="mt-8">
        <p className="text-gray-500 text-center">No se pudo cargar la información del paciente</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Mis Documentos</h2>
            <p className="text-gray-600">Guarda tus recetas, resultados y documentos médicos</p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            style={{ backgroundColor: cancerColor.color }}
            className="text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Documento
          </Button>
        </div>
      )}
      
      {hideHeader && (
        <div className="flex justify-end">
          <Button
            onClick={() => setIsDialogOpen(true)}
            style={{ backgroundColor: cancerColor.color }}
            className="text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Documento
          </Button>
        </div>
      )}

      {/* Filtros por tipo de documento */}
      {documents.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedFilter === 'todos' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('todos')}
            style={selectedFilter === 'todos' ? { backgroundColor: cancerColor.color } : {}}
            className={selectedFilter === 'todos' ? 'text-white' : ''}
          >
            Todos ({getDocumentCountByType('todos')})
          </Button>
          <Button
            variant={selectedFilter === 'examen' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('examen')}
            className={selectedFilter === 'examen' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
          >
            Exámenes ({getDocumentCountByType('examen')})
          </Button>
          <Button
            variant={selectedFilter === 'cirugia' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('cirugia')}
            className={selectedFilter === 'cirugia' ? 'bg-red-600 text-white hover:bg-red-700' : ''}
          >
            Cirugía ({getDocumentCountByType('cirugia')})
          </Button>
          <Button
            variant={selectedFilter === 'quimioterapia' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('quimioterapia')}
            className={selectedFilter === 'quimioterapia' ? 'bg-purple-600 text-white hover:bg-purple-700' : ''}
          >
            Quimioterapia ({getDocumentCountByType('quimioterapia')})
          </Button>
          <Button
            variant={selectedFilter === 'radioterapia' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('radioterapia')}
            className={selectedFilter === 'radioterapia' ? 'bg-orange-600 text-white hover:bg-orange-700' : ''}
          >
            Radioterapia ({getDocumentCountByType('radioterapia')})
          </Button>
          <Button
            variant={selectedFilter === 'receta' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('receta')}
            className={selectedFilter === 'receta' ? 'bg-green-600 text-white hover:bg-green-700' : ''}
          >
            Recetas ({getDocumentCountByType('receta')})
          </Button>
          <Button
            variant={selectedFilter === 'informe_medico' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('informe_medico')}
            className={selectedFilter === 'informe_medico' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : ''}
          >
            Informes ({getDocumentCountByType('informe_medico')})
          </Button>
          <Button
            variant={selectedFilter === 'consentimiento' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('consentimiento')}
            className={selectedFilter === 'consentimiento' ? 'bg-yellow-600 text-white hover:bg-yellow-700' : ''}
          >
            Consentimientos ({getDocumentCountByType('consentimiento')})
          </Button>
          <Button
            variant={selectedFilter === 'otro' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('otro')}
            className={selectedFilter === 'otro' ? 'bg-gray-600 text-white hover:bg-gray-700' : ''}
          >
            Otros ({getDocumentCountByType('otro')})
          </Button>
        </div>
      )}

      {documents.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <FolderOpen className="w-16 h-16 mx-auto text-gray-300" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes documentos aún</h3>
              <p className="text-gray-600 mb-6">
                Comienza a guardar tus recetas, resultados de exámenes e imágenes médicas
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                style={{ backgroundColor: cancerColor.color }}
                className="text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Subir mi primer documento
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : filteredDocuments.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FolderOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay documentos de tipo "{getDocumentTypeLabel(selectedFilter as DocumentType)}"
            </h3>
            <p className="text-gray-600">
              Intenta con otro filtro o agrega un nuevo documento
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((document) => {
            return (
              <Card key={document.id} className="hover:shadow-md transition-shadow overflow-hidden">
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  <img
                    src={document.url}
                    alt={document.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className={getDocumentTypeColor(document.type)}>
                      {getDocumentTypeLabel(document.type)}
                    </Badge>
                  </div>
                  {canDeleteDocument(document) && (
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDocument(document.id)}
                        className="text-red-500 hover:text-red-700 bg-white/80 hover:bg-white"
                        disabled={isLoading}
                        title="Eliminar documento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{document.title}</h3>
                      {document.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-1">{document.description}</p>
                      )}
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(document.uploadDate)}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDocument(document)}
                      className="text-gray-500 hover:text-gray-700 ml-2"
                      title="Ver documento"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Document Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nuevo Documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="doc-title">Título del documento</Label>
              <Input
                id="doc-title"
                placeholder="Ej: Receta Tamoxifeno"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de documento</Label>
              <Select 
                value={newDocType} 
                onValueChange={(value: DocumentType) => setNewDocType(value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="examen">Examen</SelectItem>
                  <SelectItem value="cirugia">Cirugía</SelectItem>
                  <SelectItem value="quimioterapia">Quimioterapia</SelectItem>
                  <SelectItem value="radioterapia">Radioterapia</SelectItem>
                  <SelectItem value="receta">Receta</SelectItem>
                  <SelectItem value="informe_medico">Informe Médico</SelectItem>
                  <SelectItem value="consentimiento">Consentimiento</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-description">Descripción (opcional)</Label>
              <Textarea
                id="doc-description"
                placeholder="Ej: Control post-operatorio"
                value={newDocDescription}
                onChange={(e) => setNewDocDescription(e.target.value)}
                disabled={isLoading}
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <Label>Agregar archivo</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="file"
                    id="file-upload"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={isLoading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Subir archivo
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={takePhoto}
                  disabled={isLoading}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Tomar foto
                </Button>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDialogOpen(false);
                  setNewDocTitle('');
                  setNewDocType('examen');
                  setNewDocDescription('');
                }}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddDocument}
                style={{ backgroundColor: cancerColor.color }}
                className="text-white"
                disabled={!newDocTitle.trim() || isLoading}
              >
                {isLoading ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      {selectedDocument && (
        <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedDocument.title}</DialogTitle>
            </DialogHeader>
            <div className="pt-4 space-y-4">
              <img
                src={selectedDocument.url}
                alt={selectedDocument.title}
                className="w-full max-h-96 object-contain bg-gray-50 rounded-lg"
              />
              {selectedDocument.description && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedDocument.description}</p>
                </div>
              )}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <Badge className={getDocumentTypeColor(selectedDocument.type)}>
                  {getDocumentTypeLabel(selectedDocument.type)}
                </Badge>
                <span>{formatDate(selectedDocument.uploadDate)}</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}