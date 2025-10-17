import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePatientData } from '@/hooks/usePatientData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Calendar, Edit3, Trash2, StickyNote } from 'lucide-react';
import { getNotesByPatientId, createNote, updateNote as updateNoteApi, deleteNote as deleteNoteApi } from '@/services/mockApi';
import type { PatientNote, PatientUser } from '@/types/medical';

interface NotesPatientProps {
  hideHeader?: boolean; // Prop para ocultar el header cuando se usa en un wrapper
}

export function NotesPatient({ hideHeader = false }: NotesPatientProps = {}) {
  const { user } = useAuth();
  const { cancerColor } = usePatientData();
  const [notes, setNotes] = useState<PatientNote[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState<PatientNote | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const patientUser = user as PatientUser;
  const patientId = patientUser?.patientId;

  // Cargar notas al montar el componente
  useEffect(() => {
    if (patientId) {
      loadNotes();
    }
  }, [patientId]);

  const loadNotes = () => {
    if (patientId) {
      const patientNotes = getNotesByPatientId(patientId);
      setNotes(patientNotes);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleAddNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim() || !patientId || !user) return;

    setIsLoading(true);
    try {
      await createNote({
        title: newNoteTitle,
        content: newNoteContent,
        patientId: patientId,
        authorId: user.id,
        authorName: user.name
      });

      loadNotes();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error al crear nota:', error);
      alert('Error al crear la nota');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !newNoteTitle.trim() || !newNoteContent.trim()) return;

    setIsLoading(true);
    try {
      await updateNoteApi(editingNote.id, {
        title: newNoteTitle,
        content: newNoteContent
      });

      loadNotes();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error al actualizar nota:', error);
      alert('Error al actualizar la nota');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta nota?')) return;

    setIsLoading(true);
    try {
      await deleteNoteApi(noteId);
      loadNotes();
    } catch (error) {
      console.error('Error al eliminar nota:', error);
      alert('Error al eliminar la nota');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (note: PatientNote) => {
    setEditingNote(note);
    setNewNoteTitle(note.title);
    setNewNoteContent(note.content);
    setIsDialogOpen(true);
  };

  // Verificar si el usuario actual puede editar/eliminar una nota
  const canEditNote = (note: PatientNote): boolean => {
    if (!user) return false;
    
    // El autor siempre puede editar su propia nota
    if (note.authorId === user.id) return true;
    
    // Doctores y enfermeras pueden editar cualquier nota
    if (user.role === 'doctor' || user.role === 'nurse') return true;
    
    // Guardianes pueden editar todas las notas del paciente bajo su cuidado (excepto las de doctor/enfermera)
    if (user.role === 'guardian') {
      // Si la nota es del paciente bajo su cuidado, verificar que no sea de doctor/enfermera
      if (note.patientId === patientId) {
        // Guardianes pueden editar notas de pacientes y otros guardianes, pero NO de doctor/enfermera
        const authorRole = note.authorName?.toLowerCase().includes('dr.') || 
                          note.authorName?.toLowerCase().includes('doctor') ||
                          note.authorName?.toLowerCase().includes('enferm');
        return !authorRole;
      }
    }
    
    // Pacientes pueden editar sus propias notas y las de su guardian, pero NO las de doctor/enfermera
    if (user.role === 'patient') {
      if (note.patientId === patientId) {
        // Pacientes NO pueden editar notas de doctores o enfermeras
        const authorRole = note.authorName?.toLowerCase().includes('dr.') || 
                          note.authorName?.toLowerCase().includes('doctor') ||
                          note.authorName?.toLowerCase().includes('enferm');
        return !authorRole;
      }
    }
    
    return false;
  };

  const resetForm = () => {
    setEditingNote(null);
    setNewNoteTitle('');
    setNewNoteContent('');
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        {!hideHeader && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mis Notas</h2>
            <p className="text-gray-600">Registra tus síntomas y observaciones</p>
          </div>
        )}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button
              style={{ backgroundColor: cancerColor.color }}
              className={hideHeader ? 'text-white ml-auto' : 'text-white'}
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Nota
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingNote ? 'Editar Nota' : 'Nueva Nota'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="note-title">Título</Label>
                <Input
                  id="note-title"
                  placeholder="Ej: Efectos después de quimioterapia"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note-content">Contenido</Label>
                <Textarea
                  id="note-content"
                  placeholder="Describe cómo te sientes, síntomas, observaciones..."
                  rows={5}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => handleDialogClose(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={editingNote ? handleUpdateNote : handleAddNote}
                  style={{ backgroundColor: cancerColor.color }}
                  className="text-white"
                  disabled={!newNoteTitle.trim() || !newNoteContent.trim() || isLoading}
                >
                  {isLoading ? 'Guardando...' : editingNote ? 'Actualizar' : 'Guardar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {notes.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <StickyNote className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No existen notas aún</h3>
            <p className="text-gray-600 mb-6">
              Comienza a registrar los síntomas, estado de ánimo y observaciones
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              style={{ backgroundColor: cancerColor.color }}
              className="text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear primera nota
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(note.date)}</span>
                      <span className="text-gray-400">•</span>
                      <span>Por {note.authorName}</span>
                    </div>
                  </div>
                  {canEditNote(note) && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(note)}
                        className="text-gray-500 hover:text-gray-700"
                        disabled={isLoading}
                        title="Editar nota"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-red-500 hover:text-red-700"
                        disabled={isLoading}
                        title="Eliminar nota"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}