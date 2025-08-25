import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Calendar, GraduationCap } from "lucide-react";
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

export default function AdminFormations() {
  const [formations, setFormations] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFormation, setEditingFormation] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    institution: "",
    level: "",
    description: "",
    start_date: "",
    end_date: "",
    is_current: false,
    skills: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    try {
      const { data, error } = await supabase
        .from('formations')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setFormations(data || []);
    } catch (error) {
      console.error('Error fetching formations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les formations",
        variant: "destructive"
      });
    }
  };

  const openDialog = (formation?: any) => {
    if (formation) {
      setEditingFormation(formation);
      setFormData({
        title: formation.title || "",
        institution: formation.institution || "",
        level: formation.level || "",
        description: formation.description || "",
        start_date: formation.start_date || "",
        end_date: formation.end_date || "",
        is_current: formation.is_current || false,
        skills: formation.skills?.join(', ') || ""
      });
    } else {
      setEditingFormation(null);
      setFormData({
        title: "",
        institution: "",
        level: "",
        description: "",
        start_date: "",
        end_date: "",
        is_current: false,
        skills: ""
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
    };

    try {
      if (editingFormation) {
        const { error } = await supabase
          .from('formations')
          .update(submitData)
          .eq('id', editingFormation.id);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Formation mise à jour avec succès"
        });
      } else {
        const { error } = await supabase
          .from('formations')
          .insert([submitData]);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Formation ajoutée avec succès"
        });
      }

      setIsDialogOpen(false);
      fetchFormations();
    } catch (error) {
      console.error('Error saving formation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la formation",
        variant: "destructive"
      });
    }
  };

  const deleteFormation = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) return;

    try {
      const { error } = await supabase
        .from('formations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Formation supprimée avec succès"
      });
      
      fetchFormations();
    } catch (error) {
      console.error('Error deleting formation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la formation",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-orbitron font-bold">Gestion des Formations</h2>
        <Button onClick={() => openDialog()} className="btn-cyber">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une formation
        </Button>
      </div>

      <div className="space-y-4">
        {formations.map((formation) => (
          <Card key={formation.id} className="cyber-border">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{formation.title}</CardTitle>
                  <p className="text-lg text-muted-foreground font-medium">{formation.institution}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(formation.start_date)} - {formation.is_current ? 'En cours' : formatDate(formation.end_date)}
                    </div>
                    {formation.level && (
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        {formation.level}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {formation.is_current && (
                    <Badge variant="secondary" className="bg-secondary/20">
                      En cours
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDialog(formation)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteFormation(formation.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {formation.description && (
                <p className="text-muted-foreground mb-4">{formation.description}</p>
              )}
              
              {formation.skills && formation.skills.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Compétences acquises:</h4>
                  <div className="flex flex-wrap gap-2">
                    {formation.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl cyber-border">
          <DialogHeader>
            <DialogTitle className="font-orbitron">
              {editingFormation ? 'Modifier la formation' : 'Ajouter une formation'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de la formation *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="institution">Institution *</Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Niveau</Label>
              <Input
                id="level"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                placeholder="Ex: Master, Licence, Certification..."
              />
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Date de début *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Date de fin</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  min={formData.start_date || undefined}
                  disabled={formData.is_current}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_current"
                checked={formData.is_current}
                onCheckedChange={(checked) => setFormData({ 
                  ...formData, 
                  is_current: checked,
                  end_date: checked ? "" : formData.end_date
                })}
              />
              <Label htmlFor="is_current">Formation en cours</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Compétences acquises (séparées par des virgules)</Label>
              <Input
                id="skills"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="Cybersécurité, Analyse de risques, etc."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="btn-cyber">
                {editingFormation ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}