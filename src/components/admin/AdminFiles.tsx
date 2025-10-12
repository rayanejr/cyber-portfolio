import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Upload, FileText, Download } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdminFile {
  id: string;
  filename: string;
  file_type: string;
  file_url: string;
  file_category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminFiles = () => {
  const [files, setFiles] = useState<AdminFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<AdminFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    filename: "",
    file_category: "cv",
    is_active: true
  });

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les fichiers.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${formData.file_category}_${Date.now()}.${fileExt}`;
      const filePath = `admin-files/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('admin-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('admin-files')
        .getPublicUrl(filePath);

      // Mapper le type MIME vers nos contraintes de BD
      let dbFileType = 'other';
      if (file.type.startsWith('image/')) {
        dbFileType = 'image';
      } else if (file.type === 'application/pdf') {
        dbFileType = 'pdf';
      } else if (file.type.startsWith('video/')) {
        dbFileType = 'video';
      } else if (file.type.startsWith('audio/')) {
        dbFileType = 'audio';
      } else {
        dbFileType = 'document';
      }

      const fileData = {
        filename: formData.filename || file.name,
        file_type: dbFileType,
        file_url: data.publicUrl,
        file_category: formData.file_category,
        is_active: formData.is_active
      };

      const { error } = await supabase
        .from('admin_files')
        .insert([fileData]);

      if (error) throw error;
      
      toast({
        title: "Fichier uploadé",
        description: "Le fichier a été uploadé avec succès.",
      });

      resetForm();
      fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'uploader le fichier.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (file: AdminFile) => {
    setEditingFile(file);
    setFormData({
      filename: file.filename,
      file_category: file.file_category,
      is_active: file.is_active
    });
    setIsDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFile) return;
    
    try {
      const { error } = await supabase
        .from('admin_files')
        .update({
          filename: formData.filename,
          file_category: formData.file_category,
          is_active: formData.is_active
        })
        .eq('id', editingFile.id);

      if (error) throw error;
      
      toast({
        title: "Fichier modifié",
        description: "Le fichier a été modifié avec succès.",
      });

      resetForm();
      fetchFiles();
    } catch (error) {
      console.error('Error updating file:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le fichier.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, fileUrl: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) return;

    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `admin-files/${fileName}`;

      // Delete from storage
      await supabase.storage
        .from('admin-files')
        .remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from('admin_files')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Fichier supprimé",
        description: "Le fichier a été supprimé avec succès.",
      });
      
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le fichier.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      filename: "",
      file_category: "cv",
      is_active: true
    });
    setEditingFile(null);
    setIsDialogOpen(false);
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      cv: "CV",
      profile_photo: "Photo de profil",
      logos: "Logos",
      certificates: "Certificats",
      documents: "Documents",
      images: "Images",
      other: "Autre"
    };
    return labels[category] || category;
  };

  const getCategoryBadgeVariant = (category: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      cv: "default",
      profile_photo: "default",
      logos: "secondary",
      certificates: "outline",
      documents: "outline",
      images: "secondary",
      other: "destructive"
    };
    return variants[category] || "outline";
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Gestion des Fichiers ({files.length})
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Fichier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingFile ? 'Modifier le fichier' : 'Nouveau fichier'}
                </DialogTitle>
              </DialogHeader>
              
              {editingFile ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <Label htmlFor="filename">Nom du fichier</Label>
                    <Input
                      id="filename"
                      value={formData.filename}
                      onChange={(e) => setFormData(prev => ({ ...prev, filename: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Catégorie</Label>
                    <Select
                      value={formData.file_category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, file_category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cv">CV</SelectItem>
                        <SelectItem value="profile_photo">Photo de profil</SelectItem>
                        <SelectItem value="logos">Logos</SelectItem>
                        <SelectItem value="certificates">Certificats</SelectItem>
                        <SelectItem value="documents">Documents</SelectItem>
                        <SelectItem value="images">Images</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="is_active">Actif</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">Modifier</Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Annuler
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="filename">Nom du fichier (optionnel)</Label>
                    <Input
                      id="filename"
                      value={formData.filename}
                      onChange={(e) => setFormData(prev => ({ ...prev, filename: e.target.value }))}
                      placeholder="Nom personnalisé"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Catégorie</Label>
                    <Select
                      value={formData.file_category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, file_category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cv">CV</SelectItem>
                        <SelectItem value="profile_photo">Photo de profil</SelectItem>
                        <SelectItem value="logos">Logos</SelectItem>
                        <SelectItem value="certificates">Certificats</SelectItem>
                        <SelectItem value="documents">Documents</SelectItem>
                        <SelectItem value="images">Images</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="file">Fichier</Label>
                    <Input
                      id="file"
                      type="file"
                      accept={formData.file_category === 'profile_photo' ? 'image/png' : undefined}
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                    {formData.file_category === 'profile_photo' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Uniquement les fichiers PNG
                      </p>
                    )}
                    {uploading && <span className="text-sm text-muted-foreground">Upload en cours...</span>}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="is_active">Actif</Label>
                  </div>

                  <Button type="button" variant="outline" onClick={resetForm}>
                    Annuler
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {files.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun fichier pour le moment.
            </p>
          ) : (
            files.map((file) => (
              <Card key={file.id} className="transition-all duration-300 hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{file.filename}</h3>
                        <Badge variant={getCategoryBadgeVariant(file.file_category)}>
                          {getCategoryLabel(file.file_category)}
                        </Badge>
                        {!file.is_active && (
                          <Badge variant="destructive">Inactif</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        Type: {file.file_type}
                      </p>
                      
                      <div className="text-xs text-muted-foreground">
                        Créé le: {new Date(file.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(file.file_url, '_blank')}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(file)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDelete(file.id, file.file_url)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminFiles;