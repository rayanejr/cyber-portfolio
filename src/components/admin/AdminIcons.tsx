import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image, Globe, Save, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface IconConfig {
  id: string;
  type: 'logo' | 'favicon';
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
        .eq('file_category', 'icons')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const iconConfigs = data?.map(file => ({
        id: file.id,
        type: file.file_type as 'logo' | 'favicon',
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

  const handleIconUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (type === 'favicon' && !['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      toast({
        title: "Format non supporté",
        description: "Pour le favicon, utilisez un fichier PNG ou JPG. Les fichiers ICO ne sont pas supportés.",
        variant: "destructive",
      });
      return;
    }

    setUploading(type);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = `icons/${fileName}`;

      // Upload vers le bucket admin-files
      const { error: uploadError } = await supabase.storage
        .from('admin-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('admin-files')
        .getPublicUrl(filePath);

      // Désactiver l'ancien icône du même type
      await supabase
        .from('admin_files')
        .update({ is_active: false })
        .eq('file_category', 'icons')
        .eq('file_type', type);

      // Enregistrer le nouvel icône
      const { error: dbError } = await supabase
        .from('admin_files')
        .insert({
          filename: fileName,
          file_url: data.publicUrl,
          file_type: type,
          file_category: 'icons',
          is_active: true
        });

      if (dbError) throw dbError;

      // Si c'est un favicon, mettre à jour le HTML
      if (type === 'favicon') {
        await updateFavicon(data.publicUrl);
      }

      toast({
        title: `${type === 'logo' ? 'Logo' : 'Favicon'} uploadé`,
        description: `Le ${type === 'logo' ? 'logo' : 'favicon'} a été uploadé avec succès.`,
      });
      
      fetchIcons();
    } catch (error) {
      console.error('Error uploading icon:', error);
      toast({
        title: "Erreur",
        description: `Impossible d'uploader le ${type === 'logo' ? 'logo' : 'favicon'}.`,
        variant: "destructive",
      });
    } finally {
      setUploading(null);
    }
  };

  const updateFavicon = async (faviconUrl: string) => {
    try {
      // Ici on pourrait appeler un edge function pour mettre à jour le index.html
      // Pour l'instant, on notifie l'utilisateur
      toast({
        title: "Favicon configuré",
        description: "Le favicon a été configuré. Rechargez la page pour voir les changements.",
      });
    } catch (error) {
      console.error('Error updating favicon:', error);
    }
  };

  const setActiveIcon = async (id: string, type: 'logo' | 'favicon') => {
    try {
      // Désactiver tous les icônes du même type
      await supabase
        .from('admin_files')
        .update({ is_active: false })
        .eq('file_category', 'icons')
        .eq('file_type', type);

      // Activer l'icône sélectionné
      await supabase
        .from('admin_files')
        .update({ is_active: true })
        .eq('id', id);

      toast({
        title: `${type === 'logo' ? 'Logo' : 'Favicon'} activé`,
        description: `Le ${type === 'logo' ? 'logo' : 'favicon'} a été défini comme actif.`,
      });
      
      fetchIcons();
    } catch (error) {
      console.error('Error setting active icon:', error);
      toast({
        title: "Erreur",
        description: "Impossible de définir l'icône comme actif.",
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

  const activeIcons = {
    logo: icons.find(icon => icon.type === 'logo' && icon.is_active),
    favicon: icons.find(icon => icon.type === 'favicon' && icon.is_active)
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Image className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-orbitron font-bold">Gestion des Icônes</h2>
      </div>

      {/* Icônes actives */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="cyber-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Logo du site
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeIcons.logo ? (
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <img 
                    src={activeIcons.logo.url} 
                    alt="Logo actuel"
                    className="w-16 h-16 object-contain bg-white rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{activeIcons.logo.name}</p>
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
                  onChange={(e) => handleIconUpload(e, 'logo')}
                  disabled={uploading === 'logo'}
                  className="mt-1"
                />
                {uploading === 'logo' && (
                  <p className="text-sm text-muted-foreground mt-1">Upload en cours...</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Favicon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeIcons.favicon ? (
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <img 
                    src={activeIcons.favicon.url} 
                    alt="Favicon actuel"
                    className="w-8 h-8 object-contain bg-white rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{activeIcons.favicon.name}</p>
                    <Badge variant="secondary" className="text-xs">Actif</Badge>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Aucun favicon configuré
                </p>
              )}
              
              <div>
                <Label htmlFor="favicon-upload">Uploader un nouveau favicon</Label>
                <Input
                  id="favicon-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(e) => handleIconUpload(e, 'favicon')}
                  disabled={uploading === 'favicon'}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Formats supportés: PNG, JPG. Les fichiers ICO ne sont pas supportés.
                </p>
                {uploading === 'favicon' && (
                  <p className="text-sm text-muted-foreground mt-1">Upload en cours...</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste de toutes les icônes */}
      <Card className="cyber-border">
        <CardHeader>
          <CardTitle>Toutes les icônes ({icons.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {icons.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucune icône uploadée pour le moment.
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
                              <Badge variant="outline" className="text-xs">
                                {icon.type === 'logo' ? 'Logo' : 'Favicon'}
                              </Badge>
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
                              onClick={() => setActiveIcon(icon.id, icon.type)}
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