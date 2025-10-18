import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePatientData } from '@/hooks/usePatientData';
import { apiService } from '@/services/api';
import { type PatientDocument, type DocumentType, getDocumentTypeColor, getDocumentTypeLabel } from '@/types/medical';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Textarea } from '@/components/ui/textarea'; // TODO: Descomentar cuando se habilite description
import { Plus, Calendar, Trash2, Eye, FolderOpen, Upload, Camera, FileText } from 'lucide-react';

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
  // const [newDocDescription, setNewDocDescription] = useState(''); // TODO: Descomentar cuando se habilite description
  const [selectedDocument, setSelectedDocument] = useState<PatientDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Validar si una URL es válida y accesible
  const isValidImageUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    if (!url.startsWith('http://') && !url.startsWith('https://')) return false;
    // Evitar URLs de Azure Blob Storage que no están configuradas
    if (url.includes('azuralis-docs.blob.core.windows.net')) return false;
    return true;
  };

  useEffect(() => {
    loadDocuments();
  }, [patientId]);

  useEffect(() => {
    filterDocuments();
  }, [documents, selectedFilter]);

  const loadDocuments = async () => {
    if (!patientId) return;
    try {
      const docs = await apiService.patients.getDocuments(patientId);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
    }
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
    if (!newDocTitle.trim() || !user || !patientId || !selectedFile) {
      alert('Por favor completa todos los campos y selecciona un archivo');
      return;
    }

    setIsLoading(true);
    try {
      await apiService.documents.create({
        title: newDocTitle,
        type: newDocType,
        patientId: patientId,
        uploaderId: user.id,
        uploadDate: new Date().toISOString()
      }, selectedFile);

      loadDocuments();
      setNewDocTitle('');
      setNewDocType('examen');
      setSelectedFile(null);
      // setNewDocDescription(''); // TODO: Descomentar cuando se habilite description
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error al subir documento:', error);
      alert('Error al subir el documento. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('¿Estás seguro de eliminar este documento?')) return;

    setIsLoading(true);
    try {
      await apiService.documents.delete(docId);
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

    // Validar tamaño del archivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('El archivo es muy grande. El tamaño máximo es 10MB.');
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, GIF) y PDF.');
      return;
    }

    setSelectedFile(file);
    // Usar el nombre del archivo como título si no hay uno
    if (!newDocTitle.trim()) {
      setNewDocTitle(file.name.split('.')[0]);
    }
  };

  const takePhoto = () => {
    // Crear un input invisible para capturar la foto desde la cámara
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Usar cámara trasera en móviles
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setSelectedFile(file);
        if (!newDocTitle.trim()) {
          setNewDocTitle('Foto ' + new Date().toLocaleTimeString());
        }
      }
    };
    
    input.click();
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
        // Por seguridad, los pacientes no pueden eliminar documentos subidos por profesionales
        // (Requeriría llamada API para verificar el uploader)
        return document.uploaderId === user.id;
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
                <div className="aspect-video bg-gray-100 relative overflow-hidden flex items-center justify-center">
                  {!imageErrors.has(document.id) && isValidImageUrl(document.url) ? (
                    <img
                      src={document.url}
                      alt={document.title}
                      className="w-full h-full object-cover"
                      onError={() => {
                        // Marcar esta imagen como fallida
                        setImageErrors(prev => new Set(prev).add(document.id));
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <FileText className="w-12 h-12" />
                      <span className="text-xs mt-2">Documento</span>
                    </div>
                  )}
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

            {/* TODO: Descomentar después de ejecutar update-patient-documents-table.sql
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
            */}

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

            {/* Mostrar archivo seleccionado */}
            {selectedFile && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-900 font-medium">{selectedFile.name}</span>
                    <span className="text-xs text-blue-600">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Quitar
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDialogOpen(false);
                  setNewDocTitle('');
                  setNewDocType('examen');
                  setSelectedFile(null);
                  // setNewDocDescription(''); // TODO: Descomentar cuando se habilite description
                }}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddDocument}
                style={{ backgroundColor: cancerColor.color }}
                className="text-white"
                disabled={!newDocTitle.trim() || !selectedFile || isLoading}
              >
                {isLoading ? 'Subiendo...' : 'Guardar Documento'}
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
              {isValidImageUrl(selectedDocument.url) ? (
                <div className="w-full max-h-96 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={selectedDocument.url}
                    alt={selectedDocument.title}
                    className="w-full max-h-96 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="flex flex-col items-center justify-center text-gray-400 p-8">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <span class="text-sm mt-4">No se pudo cargar la vista previa</span>
                            <span class="text-xs text-gray-500 mt-2">El documento puede no estar disponible</span>
                          </div>
                        `;
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-full max-h-96 bg-gray-50 rounded-lg flex flex-col items-center justify-center text-gray-400 p-8">
                  <FileText className="w-16 h-16 mb-4" />
                  <span className="text-sm">Vista previa no disponible</span>
                  <span className="text-xs text-gray-500 mt-2">El documento puede no estar configurado</span>
                </div>
              )}
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