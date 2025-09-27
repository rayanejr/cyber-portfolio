import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image, Save, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface IconConfig {
  id: string;
  name: string;
  url: string;
  is_active: boolean;
}

const AdminIcons = () => {
  const [icons, setIcons] = useState<IconConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchIcons();
  }, []);

  const fetchIcons = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_files')
        .select('*')
        .eq('file_category', 'logos')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const iconConfigs = data?.map(file => ({
        id: file.id,
        name: file.filename,
        url: file.file_url,
        is_active: file.is_active
      })) || [];
      
      setIcons(iconConfigs);
    } catch (error) {
      console.error('Error fetching icons:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les icônes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'].includes(file.type)) {
      toast({
        title: "Format non supporté",
        description: "Utilisez un fichier PNG, JPG, GIF ou SVG.",
        variant: "destructive",
      });
      return;
    }

    setUploading('logo');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `icons/${fileName}`;

      // Upload vers le bucket admin-files
      const { error: uploadError } = await supabase.storage
        .from('admin-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('admin-files')
        .getPublicUrl(filePath);

      // Désactiver l'ancien logo
      await supabase
        .from('admin_files')
        .update({ is_active: false })
        .eq('file_category', 'logos')
        .eq('file_type', 'logo');

      // Enregistrer le nouveau logo
      const { error: dbError } = await supabase
        .from('admin_files')
        .insert({
          filename: fileName,
          file_url: data.publicUrl,
          file_type: 'logo',
          file_category: 'logos',
          is_active: true
        });

      if (dbError) throw dbError;

      toast({
        title: "Logo uploadé",
        description: "Le logo a été uploadé avec succès.",
      });
      
      fetchIcons();
      // Rafraîchir la page pour que les autres composants voient le nouveau logo
      window.location.reload();
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'uploader le logo.",
        variant: "destructive",
      });
    } finally {
      setUploading(null);
    }
  };

  const setActiveLogo = async (id: string) => {
    try {
      // Désactiver tous les logos
      await supabase
        .from('admin_files')
        .update({ is_active: false })
        .eq('file_category', 'logos')
        .eq('file_type', 'logo');

      // Activer le logo sélectionné
      await supabase
        .from('admin_files')
        .update({ is_active: true })
        .eq('id', id);

      toast({
        title: "Logo activé",
        description: "Le logo a été défini comme actif.",
      });
      
      fetchIcons();
      // Rafraîchir la page pour que les autres composants voient le nouveau logo
      window.location.reload();
    } catch (error) {
      console.error('Error setting active logo:', error);
      toast({
        title: "Erreur",
        description: "Impossible de définir le logo comme actif.",
        variant: "destructive",
      });
    }
  };

  const deleteIcon = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette icône ?')) return;

    try {
      const { error } = await supabase
        .from('admin_files')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Icône supprimée",
        description: "L'icône a été supprimée avec succès.",
      });
      
      fetchIcons();
    } catch (error) {
      console.error('Error deleting icon:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'icône.",
        variant: "destructive",
      });
    }
  };

  const activeLogo = icons.find(icon => icon.is_active);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Image className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-orbitron font-bold">Gestion du Logo</h2>
      </div>

      {/* Logo actif */}
      <Card className="cyber-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Logo du site
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeLogo ? (
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <img 
                  src={activeLogo.url} 
                  alt="Logo actuel"
                  className="w-16 h-16 object-contain bg-white rounded"
                />
                <div className="flex-1">
                  <p className="font-medium">{activeLogo.name}</p>
                  <Badge variant="secondary" className="text-xs">Actif</Badge>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Aucun logo configuré
              </p>
            )}
            
            <div>
              <Label htmlFor="logo-upload">Uploader un nouveau logo</Label>
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading === 'logo'}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Formats supportés: PNG, JPG, GIF, SVG. Le logo sera automatiquement mis à jour dans le header et footer.
              </p>
              {uploading === 'logo' && (
                <p className="text-sm text-muted-foreground mt-1">Upload en cours...</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste de tous les logos */}
      <Card className="cyber-border">
        <CardHeader>
          <CardTitle>Tous les logos ({icons.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             {icons.length === 0 ? (
               <p className="text-center text-muted-foreground py-8">
                 Aucun logo uploadé pour le moment.
               </p>
            ) : (
              <div className="grid gap-4">
                {icons.map((icon) => (
                  <Card key={icon.id} className="transition-all duration-300 hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img 
                            src={icon.url} 
                            alt={icon.name}
                            className="w-12 h-12 object-contain bg-muted rounded"
                          />
                           <div>
                             <p className="font-medium">{icon.name}</p>
                             <div className="flex items-center gap-2">
                               <Badge variant="outline" className="text-xs">Logo</Badge>
                               {icon.is_active && (
                                 <Badge variant="secondary" className="text-xs">Actif</Badge>
                               )}
                             </div>
                           </div>
                        </div>
                        
                         <div className="flex gap-2">
                           {!icon.is_active && (
                             <Button 
                               size="sm" 
                               variant="outline"
                               onClick={() => setActiveLogo(icon.id)}
                             >
                               <Save className="w-4 h-4 mr-2" />
                               Activer
                             </Button>
                           )}
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => deleteIcon(icon.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminIcons;