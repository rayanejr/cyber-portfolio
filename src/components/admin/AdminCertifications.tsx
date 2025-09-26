import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileUploader } from "./FileUploader";

export default function AdminCertifications() {
  const [certifications, setCertifications] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    issuer: "",
    issue_date: "",
    expiry_date: "",
    credential_id: "",
    credential_url: "",
    pdf_url: "",
    image_url: "",
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .order('issue_date', { ascending: false });

      if (error) throw error;
      setCertifications(data || []);
    } catch (error) {
      console.error('Error fetching certifications:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les certifications",
        variant: "destructive"
      });
    }
  };

  const openDialog = (cert?: any) => {
    if (cert) {
      setEditingCert(cert);
      setFormData({
        name: cert.name || "",
        issuer: cert.issuer || "",
        issue_date: cert.issue_date || "",
        expiry_date: cert.expiry_date || "",
        credential_id: cert.credential_id || "",
        credential_url: cert.credential_url || "",
        pdf_url: cert.pdf_url || "",
        image_url: cert.image_url || "",
        is_active: cert.is_active ?? true
      });
    } else {
      setEditingCert(null);
      setFormData({
        name: "",
        issuer: "",
        issue_date: "",
        expiry_date: "",
        credential_id: "",
        credential_url: "",
        pdf_url: "",
        image_url: "",
        is_active: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCert) {
        const { error } = await supabase
          .from('certifications')
          .update(formData)
          .eq('id', editingCert.id);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Certification mise à jour avec succès"
        });
      } else {
        const { error } = await supabase
          .from('certifications')
          .insert([formData]);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Certification ajoutée avec succès"
        });
      }

      setIsDialogOpen(false);
      fetchCertifications();
    } catch (error) {
      console.error('Error saving certification:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la certification",
        variant: "destructive"
      });
    }
  };

  const deleteCertification = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette certification ?')) return;

    try {
      const { error } = await supabase
        .from('certifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Certification supprimée avec succès"
      });
      
      fetchCertifications();
    } catch (error) {
      console.error('Error deleting certification:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la certification",
        variant: "destructive"
      });
    }
  };

  const viewCertification = (cert: any) => {
    if (cert.pdf_url) {
      window.open(cert.pdf_url, '_blank');
    } else if (cert.image_url) {
      window.open(cert.image_url, '_blank');
    } else if (cert.credential_url) {
      window.open(cert.credential_url, '_blank');
    } else {
      toast({
        title: "Aucun fichier",
        description: "Aucun document ou lien n'est disponible pour cette certification",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-orbitron font-bold">Gestion des Certifications</h2>
        <Button onClick={() => openDialog()} className="btn-cyber">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une certification
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certifications.map((cert) => (
          <Card key={cert.id} className="cyber-border">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{cert.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                </div>
                <Badge variant={cert.is_active ? "default" : "secondary"}>
                  {cert.is_active ? "Actif" : "Inactif"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <p className="text-sm">
                  <strong>Émise:</strong> {new Date(cert.issue_date).toLocaleDateString('fr-FR')}
                </p>
                {cert.expiry_date && (
                  <p className="text-sm">
                    <strong>Expire:</strong> {new Date(cert.expiry_date).toLocaleDateString('fr-FR')}
                  </p>
                )}
                {cert.credential_id && (
                  <p className="text-sm">
                    <strong>ID:</strong> {cert.credential_id}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => viewCertification(cert)}
                  disabled={!cert.pdf_url && !cert.image_url && !cert.credential_url}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Voir
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openDialog(cert)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteCertification(cert.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl cyber-border">
          <DialogHeader>
            <DialogTitle className="font-orbitron">
              {editingCert ? 'Modifier la certification' : 'Ajouter une certification'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la certification *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issuer">Organisme émetteur *</Label>
                <Input
                  id="issuer"
                  value={formData.issuer}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issue_date">Date d'émission *</Label>
                <Input
                  id="issue_date"
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry_date">Date d'expiration</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  min={formData.issue_date || undefined}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="credential_id">ID de credential</Label>
              <Input
                id="credential_id"
                value={formData.credential_id}
                onChange={(e) => setFormData({ ...formData, credential_id: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credential_url">URL de vérification</Label>
              <Input
                id="credential_url"
                type="url"
                value={formData.credential_url}
                onChange={(e) => setFormData({ ...formData, credential_url: e.target.value })}
              />
            </div>

            <FileUploader
              label="Fichier PDF ou Image de certification"
              accept=".pdf,image/*"
              bucket="admin-files"
              folder="certifications"
              maxSizeMB={20}
              currentFile={formData.pdf_url || formData.image_url}
              onUpload={(url, type) => {
                console.log('File uploaded:', url, type);
                if (type === 'pdf' || type === 'application/pdf' || url.toLowerCase().includes('.pdf')) {
                  setFormData({ ...formData, pdf_url: url, image_url: "" });
                } else if (type === 'image' || type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
                  setFormData({ ...formData, image_url: url, pdf_url: "" });
                } else {
                  setFormData({ ...formData, pdf_url: url });
                }
              }}
              onRemove={() => setFormData({ ...formData, pdf_url: "", image_url: "" })}
            />

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Certification active</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="btn-cyber">
                {editingCert ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}