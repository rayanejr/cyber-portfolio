import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Calendar, MapPin } from "lucide-react";
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

export default function AdminExperiences() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    start_date: "",
    end_date: "",
    is_current: false,
    technologies: "",
    achievements: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setExperiences(data || []);
    } catch (error) {
      console.error('Error fetching experiences:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les expériences",
        variant: "destructive"
      });
    }
  };

  const openDialog = (exp?: any) => {
    if (exp) {
      setEditingExp(exp);
      setFormData({
        title: exp.title || "",
        company: exp.company || "",
        location: exp.location || "",
        description: exp.description || "",
        start_date: exp.start_date || "",
        end_date: exp.end_date || "",
        is_current: exp.is_current || false,
        technologies: exp.technologies?.join(', ') || "",
        achievements: exp.achievements?.join('\n') || ""
      });
    } else {
      setEditingExp(null);
      setFormData({
        title: "",
        company: "",
        location: "",
        description: "",
        start_date: "",
        end_date: "",
        is_current: false,
        technologies: "",
        achievements: ""
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      technologies: formData.technologies.split(',').map(t => t.trim()).filter(t => t),
      achievements: formData.achievements.split('\n').filter(a => a.trim())
    };

    try {
      if (editingExp) {
        const { error } = await supabase
          .from('experiences')
          .update(submitData)
          .eq('id', editingExp.id);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Expérience mise à jour avec succès"
        });
      } else {
        const { error } = await supabase
          .from('experiences')
          .insert([submitData]);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Expérience ajoutée avec succès"
        });
      }

      setIsDialogOpen(false);
      fetchExperiences();
    } catch (error) {
      console.error('Error saving experience:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'expérience",
        variant: "destructive"
      });
    }
  };

  const deleteExperience = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette expérience ?')) return;

    try {
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Expérience supprimée avec succès"
      });
      
      fetchExperiences();
    } catch (error) {
      console.error('Error deleting experience:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'expérience",
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
        <h2 className="text-2xl font-orbitron font-bold">Gestion des Expériences</h2>
        <Button onClick={() => openDialog()} className="btn-cyber">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une expérience
        </Button>
      </div>

      <div className="space-y-4">
        {experiences.map((exp) => (
          <Card key={exp.id} className="cyber-border">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{exp.title}</CardTitle>
                  <p className="text-lg text-muted-foreground font-medium">{exp.company}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(exp.start_date)} - {exp.is_current ? 'Présent' : formatDate(exp.end_date)}
                    </div>
                    {exp.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {exp.location}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {exp.is_current && (
                    <Badge variant="secondary" className="bg-secondary/20">
                      En cours
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDialog(exp)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteExperience(exp.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {exp.description && (
                <p className="text-muted-foreground mb-4">{exp.description}</p>
              )}
              
              {exp.technologies && exp.technologies.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Technologies utilisées:</h4>
                  <div className="flex flex-wrap gap-2">
                    {exp.technologies.map((tech: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {exp.achievements && exp.achievements.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Réalisations clés:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {exp.achievements.map((achievement: string, index: number) => (
                      <li key={index}>{achievement}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl cyber-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-orbitron">
              {editingExp ? 'Modifier l\'expérience' : 'Ajouter une expérience'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du poste *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Entreprise *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Lieu</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
              <Label htmlFor="is_current">Poste actuel</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="technologies">Technologies (séparées par des virgules)</Label>
              <Input
                id="technologies"
                value={formData.technologies}
                onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                placeholder="Python, React, AWS, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="achievements">Réalisations (une par ligne)</Label>
              <Textarea
                id="achievements"
                value={formData.achievements}
                onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                rows={4}
                placeholder="Chaque ligne représente une réalisation"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="btn-cyber">
                {editingExp ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}