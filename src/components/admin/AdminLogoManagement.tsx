import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Image, 
  Upload, 
  Edit, 
  Trash2, 
  Eye, 
  Settings,
  Palette,
  Monitor,
  Smartphone,
  Download,
  RotateCcw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileUploader } from './FileUploader';

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

export const AdminLogoManagement: React.FC<AdminLogoManagementProps> = ({ currentUser }) => {
  const { toast } = useToast();
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingLogo, setEditingLogo] = useState<Logo | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'main',
    description: '',
    file_url: '',
    file_type: '',
    is_active: true
  });

  const logoCategories = [
    { value: 'main', label: 'Logo Principal', description: 'Logo utilisé dans la navigation' },
    { value: 'favicon', label: 'Favicon', description: 'Icône dans l\'onglet du navigateur' },
    { value: 'social', label: 'Réseaux Sociaux', description: 'Logo pour les partages sociaux' },
    { value: 'print', label: 'Impression', description: 'Version haute résolution pour impression' },
    { value: 'dark', label: 'Mode Sombre', description: 'Version pour thème sombre' },
    { value: 'light', label: 'Mode Clair', description: 'Version pour thème clair' }
  ];

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_files')
        .select('*')
        .eq('file_category', 'logo')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogos(data || []);
    } catch (error: any) {
      console.error('Error fetching logos:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les logos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.file_url) {
      toast({
        title: "Erreur",
        description: "Veuillez uploader un fichier",
        variant: "destructive"
      });
      return;
    }

    try {
      const logoData = {
        filename: formData.name,
        file_url: formData.file_url,
        file_type: formData.file_type,
        file_category: 'logo',
        is_active: formData.is_active
      };

      if (editingLogo) {
        const { error } = await supabase
          .from('admin_files')
          .update(logoData)
          .eq('id', editingLogo.id);

        if (error) throw error;
        
        toast({
          title: "Logo modifié",
          description: "Le logo a été modifié avec succès",
        });
      } else {
        const { error } = await supabase
          .from('admin_files')
          .insert([logoData]);

        if (error) throw error;
        
        toast({
          title: "Logo ajouté",
          description: "Le logo a été ajouté avec succès",
        });
      }

      resetForm();
      fetchLogos();
    } catch (error: any) {
      console.error('Error saving logo:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le logo",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (logo: Logo) => {
    setEditingLogo(logo);
    setFormData({
      name: logo.filename || '',
      category: 'main', // Simplification pour cette demo
      description: '',
      file_url: logo.file_url,
      file_type: logo.file_type,
      is_active: logo.is_active ?? true
    });
    setShowCreateDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce logo ?')) return;

    try {
      const { error } = await supabase
        .from('admin_files')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Logo supprimé",
        description: "Le logo a été supprimé avec succès",
      });
      
      fetchLogos();
    } catch (error: any) {
      console.error('Error deleting logo:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le logo",
        variant: "destructive"
      });
    }
  };

  const setAsActive = async (id: string) => {
    try {
      // Désactiver tous les autres logos de la même catégorie
      await supabase
        .from('admin_files')
        .update({ is_active: false })
        .eq('file_category', 'logo');

      // Activer le logo sélectionné
      const { error } = await supabase
        .from('admin_files')
        .update({ is_active: true })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Logo activé",
        description: "Ce logo est maintenant actif",
      });
      
      fetchLogos();
    } catch (error: any) {
      console.error('Error activating logo:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'activer le logo",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'main',
      description: '',
      file_url: '',
      file_type: '',
      is_active: true
    });
    setEditingLogo(null);
    setShowCreateDialog(false);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('svg')) return '🎨';
    if (fileType.includes('png')) return '🖼️';
    if (fileType.includes('jpg') || fileType.includes('jpeg')) return '📷';
    return '📁';
  };

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Vous devez être connecté pour accéder à cette section.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Logos</h2>
          <p className="text-muted-foreground">
            Gérez les logos et éléments visuels du site
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Upload className="h-4 w-4 mr-2" />
              Nouveau Logo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingLogo ? 'Modifier le logo' : 'Ajouter un nouveau logo'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du logo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Logo principal, Favicon..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {logoCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  {logoCategories.find(c => c.value === formData.category)?.description}
                </p>
              </div>

              <FileUploader
                label="Fichier logo"
                accept="image/*,.svg"
                bucket="admin-files"
                folder="logos"
                maxSizeMB={5}
                currentFile={formData.file_url}
                onUpload={(url, type) => {
                  setFormData({ 
                    ...formData, 
                    file_url: url, 
                    file_type: type === 'image' ? 'image' : 'svg'
                  });
                }}
                onRemove={() => setFormData({ ...formData, file_url: '', file_type: '' })}
              />

              <div className="space-y-2">
                <Label htmlFor="description">Description (optionnel)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du logo..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Logo actif</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
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

      {/* Aperçu du logo actif */}
      {logos.some(logo => logo.is_active) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Logo Actuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {logos
                .filter(logo => logo.is_active)
                .map(logo => (
                  <div key={logo.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <img 
                      src={logo.file_url} 
                      alt={logo.filename}
                      className="h-12 w-auto object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div>
                      <p className="font-medium">{logo.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {getFileIcon(logo.file_type)} {logo.file_type}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Actif
                    </Badge>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des logos */}
      <Card>
        <CardHeader>
          <CardTitle>Tous les Logos ({logos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : logos.length === 0 ? (
            <div className="text-center py-8">
              <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun logo pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {logos.map((logo) => (
                <Card key={logo.id} className="transition-all duration-300 hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Aperçu du logo */}
                      <div className="aspect-video bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                        <img 
                          src={logo.file_url} 
                          alt={logo.filename}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            e.currentTarget.parentElement!.innerHTML = 
                              `<div class="text-muted-foreground">${getFileIcon(logo.file_type)} Aperçu indisponible</div>`;
                          }}
                        />
                      </div>
                      
                      {/* Informations */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium truncate">{logo.filename}</h3>
                          {logo.is_active && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Actif
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {getFileIcon(logo.file_type)} {logo.file_type} • 
                          {new Date(logo.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => window.open(logo.file_url, '_blank')}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit(logo)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!logo.is_active && (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => setAsActive(logo.id)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDelete(logo.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conseils d'optimisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Conseils d'Optimisation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Formats Recommandés
              </h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• SVG pour la scalabilité parfaite</li>
                <li>• PNG avec transparence</li>
                <li>• JPG pour les photos de logos</li>
                <li>• ICO pour les favicons</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Bonnes Pratiques
              </h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Taille max recommandée: 500KB</li>
                <li>• Résolution minimale: 200x200px</li>
                <li>• Prévoir versions clair/sombre</li>
                <li>• Optimiser pour mobile</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};