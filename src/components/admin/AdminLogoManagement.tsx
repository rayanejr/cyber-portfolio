import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Check, Palette, Crown } from 'lucide-react';

interface Logo {
  id: string;
  filename: string;
  file_url: string;
  file_type: string;
  file_category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AdminLogoManagementProps {
  currentUser: any;
}

const AdminLogoManagement: React.FC<AdminLogoManagementProps> = ({ currentUser }) => {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLogo, setEditingLogo] = useState<Logo | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    filename: '',
    file_url: '',
    file_type: 'image',
    description: '',
    is_active: false
  });

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_files')
        .select('*')
        .eq('file_category', 'logos') // Utiliser 'logos' au lieu de 'logo'
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogos(data || []);
    } catch (error) {
      console.error('Error fetching logos:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les logos.",
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
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      console.log(`Uploading logo to: ${filePath}`);

      const { error: uploadError } = await supabase.storage
        .from('admin-files')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('admin-files')
        .getPublicUrl(filePath);

      console.log('Logo uploaded successfully:', data.publicUrl);

      setFormData(prev => ({ 
        ...prev, 
        filename: fileName,
        file_url: data.publicUrl
      }));
      
      toast({
        title: "Logo uploadé",
        description: "Le logo a été uploadé avec succès.",
      });
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'uploader le logo.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.file_url) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Saving logo data:', formData);

      const logoData = {
        filename: formData.filename,
        file_url: formData.file_url,
        file_type: 'image', // Type correct pour les images
        file_category: 'logos', // Utiliser 'logos' au lieu de 'logo'
        is_active: formData.is_active
      };

      if (editingLogo) {
        const { error } = await supabase
          .from('admin_files')
          .update(logoData)
          .eq('id', editingLogo.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        
        toast({
          title: "Logo modifié",
          description: "Le logo a été modifié avec succès.",
        });
      } else {
        const { error } = await supabase
          .from('admin_files')
          .insert([logoData]);

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        
        toast({
          title: "Logo ajouté",
          description: "Le logo a été ajouté avec succès.",
        });
      }

      resetForm();
      fetchLogos();
      window.dispatchEvent(new CustomEvent('logoUpdated'));
      
    } catch (error: any) {
      console.error('Error saving logo:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder le logo.",
        variant: "destructive",
      });
    }
  };

  const setAsActive = async (id: string, file_type: string) => {
    try {
      await supabase
        .from('admin_files')
        .update({ is_active: false })
        .eq('file_category', 'logos'); // Utiliser 'logos' au lieu de 'logo'

      const { error } = await supabase
        .from('admin_files')
        .update({ is_active: true })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Logo activé",
        description: "Le logo a été défini comme actif.",
      });
      
      fetchLogos();
      window.dispatchEvent(new CustomEvent('logoUpdated'));
      
    } catch (error) {
      console.error('Error setting logo as active:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'activer le logo.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      filename: '',
      file_url: '',
      file_type: 'image',
      description: '',
      is_active: false
    });
    setEditingLogo(null);
    setIsDialogOpen(false);
  };

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Vous devez être connecté pour gérer les logos.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) return <div>Chargement...</div>;

  const activeLogo = logos.find(logo => logo.is_active && logo.file_type === 'logo');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Gestion des Logos ({logos.length})
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau Logo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingLogo ? 'Modifier le logo' : 'Nouveau logo'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="logo-upload">Fichier logo</Label>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                    {formData.file_url && (
                       <div className="mt-2">
                         <img 
                           src={formData.file_url} 
                           alt="Preview" 
                           className="w-24 h-24 object-contain rounded border bg-white" 
                           onError={(e) => {
                             console.error('Image preview error:', e);
                             e.currentTarget.style.display = 'none';
                           }}
                         />
                       </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="is_active">Activer ce logo</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={!formData.file_url}>
                      {editingLogo ? 'Modifier' : 'Ajouter'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Annuler
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Liste des logos */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {logos.map((logo) => (
              <Card key={logo.id} className={`transition-all duration-300 ${logo.is_active ? 'border-primary/50 bg-primary/5' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <img 
                      src={logo.file_url} 
                      alt={logo.filename}
                      className="w-12 h-12 object-contain rounded border"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{logo.file_type}</h3>
                      <p className="text-xs text-muted-foreground truncate">{logo.filename}</p>
                      {logo.is_active && <Badge className="text-xs mt-1">Actif</Badge>}
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    {!logo.is_active && (
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => setAsActive(logo.id, logo.file_type)}
                        className="flex-1"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogoManagement;