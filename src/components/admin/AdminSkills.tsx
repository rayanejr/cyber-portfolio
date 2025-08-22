import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminSkills() {
  const [skills, setSkills] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    level: 5,
    icon: "",
    is_featured: false
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setSkills(data || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les compétences",
        variant: "destructive"
      });
    }
  };

  const openDialog = (skill?: any) => {
    if (skill) {
      setEditingSkill(skill);
      setFormData({
        name: skill.name || "",
        category: skill.category || "",
        description: skill.description || "",
        level: skill.level || 5,
        icon: skill.icon || "",
        is_featured: skill.is_featured || false
      });
    } else {
      setEditingSkill(null);
      setFormData({
        name: "",
        category: "",
        description: "",
        level: 5,
        icon: "",
        is_featured: false
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingSkill) {
        const { error } = await supabase
          .from('skills')
          .update(formData)
          .eq('id', editingSkill.id);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Compétence mise à jour avec succès"
        });
      } else {
        const { error } = await supabase
          .from('skills')
          .insert([formData]);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Compétence ajoutée avec succès"
        });
      }

      setIsDialogOpen(false);
      fetchSkills();
    } catch (error) {
      console.error('Error saving skill:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la compétence",
        variant: "destructive"
      });
    }
  };

  const deleteSkill = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette compétence ?')) return;

    try {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Compétence supprimée avec succès"
      });
      
      fetchSkills();
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la compétence",
        variant: "destructive"
      });
    }
  };

  const skillsByCategory = skills.reduce((acc: any, skill: any) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {});

  const getLevelColor = (level: number) => {
    if (level >= 8) return "text-secondary";
    if (level >= 6) return "text-primary";
    if (level >= 4) return "text-accent";
    return "text-muted-foreground";
  };

  const getLevelText = (level: number) => {
    if (level >= 9) return "Expert";
    if (level >= 7) return "Avancé";
    if (level >= 5) return "Intermédiaire";
    if (level >= 3) return "Débutant";
    return "Novice";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-orbitron font-bold">Gestion des Compétences</h2>
        <Button onClick={() => openDialog()} className="btn-cyber">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une compétence
        </Button>
      </div>

      <div className="space-y-6">
        {Object.entries(skillsByCategory).map(([category, categorySkills]: [string, any]) => (
          <div key={category}>
            <h3 className="text-xl font-orbitron font-bold mb-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              {category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorySkills.map((skill: any) => (
                <Card key={skill.id} className="cyber-border">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {skill.is_featured && <Star className="h-4 w-4 text-secondary fill-current" />}
                          {skill.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getLevelColor(skill.level)}`}
                          >
                            {getLevelText(skill.level)} ({skill.level}/10)
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog(skill)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteSkill(skill.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {skill.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{skill.description}</p>
                    </CardContent>
                  )}
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
              {editingSkill ? 'Modifier la compétence' : 'Ajouter une compétence'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la compétence *</Label>
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
                  placeholder="Ex: Sécurité Offensive, Sécurité Défensive..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">
                Niveau de maîtrise: {formData.level}/10 ({getLevelText(formData.level)})
              </Label>
              <Slider
                id="level"
                min={1}
                max={10}
                step={1}
                value={[formData.level]}
                onValueChange={(value) => setFormData({ ...formData, level: value[0] })}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icône (optionnel)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="Nom de l'icône Lucide React"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
              />
              <Label htmlFor="is_featured">Compétence mise en avant</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="btn-cyber">
                {editingSkill ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}