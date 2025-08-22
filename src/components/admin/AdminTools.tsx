import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminTools() {
  const [tools, setTools] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    config: "",
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setTools(data || []);
    } catch (error) {
      console.error('Error fetching tools:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les outils",
        variant: "destructive"
      });
    }
  };

  const openDialog = (tool?: any) => {
    if (tool) {
      setEditingTool(tool);
      setFormData({
        name: tool.name || "",
        description: tool.description || "",
        category: tool.category || "",
        config: tool.config ? JSON.stringify(tool.config, null, 2) : "",
        is_active: tool.is_active ?? true
      });
    } else {
      setEditingTool(null);
      setFormData({
        name: "",
        description: "",
        category: "",
        config: "",
        is_active: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let parsedConfig = null;
    if (formData.config.trim()) {
      try {
        parsedConfig = JSON.parse(formData.config);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Format JSON invalide dans la configuration",
          variant: "destructive"
        });
        return;
      }
    }

    const submitData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      config: parsedConfig,
      is_active: formData.is_active
    };

    try {
      if (editingTool) {
        const { error } = await supabase
          .from('tools')
          .update(submitData)
          .eq('id', editingTool.id);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Outil mis à jour avec succès"
        });
      } else {
        const { error } = await supabase
          .from('tools')
          .insert([submitData]);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Outil ajouté avec succès"
        });
      }

      setIsDialogOpen(false);
      fetchTools();
    } catch (error) {
      console.error('Error saving tool:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'outil",
        variant: "destructive"
      });
    }
  };

  const deleteTool = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet outil ?')) return;

    try {
      const { error } = await supabase
        .from('tools')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Outil supprimé avec succès"
      });
      
      fetchTools();
    } catch (error) {
      console.error('Error deleting tool:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'outil",
        variant: "destructive"
      });
    }
  };

  const toolsByCategory = tools.reduce((acc: any, tool: any) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-orbitron font-bold">Gestion des Outils</h2>
        <Button onClick={() => openDialog()} className="btn-cyber">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un outil
        </Button>
      </div>

      <div className="space-y-6">
        {Object.entries(toolsByCategory).map(([category, categoryTools]: [string, any]) => (
          <div key={category}>
            <h3 className="text-xl font-orbitron font-bold mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              {category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryTools.map((tool: any) => (
                <Card key={tool.id} className="cyber-border">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{tool.name}</CardTitle>
                        <Badge 
                          variant={tool.is_active ? "default" : "secondary"}
                          className="mt-2"
                        >
                          {tool.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog(tool)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteTool(tool.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{tool.description}</p>
                    {tool.config && (
                      <div className="text-xs text-muted-foreground">
                        <strong>Configuration:</strong> {Object.keys(tool.config).length} paramètre(s)
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl cyber-border">
          <DialogHeader>
            <DialogTitle className="font-orbitron">
              {editingTool ? 'Modifier l\'outil' : 'Ajouter un outil'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'outil *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  placeholder="Ex: Pentest, Monitoring, Analysis..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="config">Configuration (JSON)</Label>
              <Textarea
                id="config"
                value={formData.config}
                onChange={(e) => setFormData({ ...formData, config: e.target.value })}
                rows={6}
                placeholder='{"version": "1.0", "options": ["option1", "option2"]}'
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Configuration au format JSON pour paramétrer l'outil (optionnel)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Outil actif</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="btn-cyber">
                {editingTool ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}