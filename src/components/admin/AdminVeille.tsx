import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RefreshCw, Plus, Edit, Trash2, ExternalLink, Clock, Database } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface VeilleItem {
  id: string;
  title: string;
  url: string;
  content?: string;
  excerpt?: string;
  source: string;
  category: string;
  keywords: string[];
  severity?: string;
  cve_id?: string;
  published_at: string;
  imported_at: string;
  is_featured: boolean;
  is_active: boolean;
}

interface VeilleSource {
  id: string;
  name: string;
  url: string;
  type: string;
  config: any;
  keywords: string[];
  is_active: boolean;
  last_sync?: string;
}

const AdminVeille = () => {
  const [items, setItems] = useState<VeilleItem[]>([]);
  const [sources, setSources] = useState<VeilleSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSourceDialogOpen, setIsSourceDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VeilleItem | null>(null);
  const [editingSource, setEditingSource] = useState<VeilleSource | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    content: "",
    excerpt: "",
    source: "",
    category: "Vulnérabilités",
    keywords: "",
    severity: "",
    cve_id: "",
    published_at: new Date().toISOString().split('T')[0],
    is_featured: false,
    is_active: true,
  });

  const [sourceFormData, setSourceFormData] = useState({
    name: "",
    url: "",
    type: "rss",
    keywords: "",
    is_active: true,
  });

  const categories = [
    "Vulnérabilités", "Exploits/PoC", "Advisories", "Malware/Threat",
    "Cloud/Infra", "Blue Team", "Outils", "Lecture longue"
  ];

  const severities = ["Critical", "High", "Medium", "Low"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchItems(), fetchSources()]);
    setLoading(false);
  };

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('veille_techno')
        .select('*')
        .order('imported_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching veille items:', error);
    }
  };

  const fetchSources = async () => {
    try {
      const { data, error } = await supabase
        .from('veille_sources')
        .select('*')
        .order('name');

      if (error) throw error;
      setSources(data || []);
    } catch (error) {
      console.error('Error fetching veille sources:', error);
    }
  };

  const handleImportNow = async () => {
    setImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('veille-import', {
        body: { manual: true }
      });

      if (error) throw error;

      toast({
        title: "Import réussi",
        description: `${data.imported || 0} nouveaux éléments importés`,
      });

      fetchItems();
    } catch (error) {
      console.error('Error importing:', error);
      toast({
        title: "Erreur d'import",
        description: "Erreur lors de l'import",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const itemData = {
        ...formData,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
        published_at: new Date(formData.published_at).toISOString(),
      };

      if (editingItem) {
        const { error } = await supabase
          .from('veille_techno')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast({ title: "Élément mis à jour avec succès" });
      } else {
        const { error } = await supabase
          .from('veille_techno')
          .insert(itemData);

        if (error) throw error;
        toast({ title: "Élément créé avec succès" });
      }

      resetForm();
      fetchItems();
    } catch (error) {
      console.error('Error saving item:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde",
        variant: "destructive",
      });
    }
  };

  const handleSourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const sourceData = {
        ...sourceFormData,
        keywords: sourceFormData.keywords.split(',').map(k => k.trim()).filter(k => k),
        config: sourceFormData.type === 'rss' ? { feed_url: sourceFormData.url } : {},
      };

      if (editingSource) {
        const { error } = await supabase
          .from('veille_sources')
          .update(sourceData)
          .eq('id', editingSource.id);

        if (error) throw error;
        toast({ title: "Source mise à jour avec succès" });
      } else {
        const { error } = await supabase
          .from('veille_sources')
          .insert(sourceData);

        if (error) throw error;
        toast({ title: "Source créée avec succès" });
      }

      resetSourceForm();
      fetchSources();
    } catch (error) {
      console.error('Error saving source:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: VeilleItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      url: item.url,
      content: item.content || "",
      excerpt: item.excerpt || "",
      source: item.source,
      category: item.category,
      keywords: item.keywords.join(', '),
      severity: item.severity || "",
      cve_id: item.cve_id || "",
      published_at: item.published_at.split('T')[0],
      is_featured: item.is_featured,
      is_active: item.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleEditSource = (source: VeilleSource) => {
    setEditingSource(source);
    setSourceFormData({
      name: source.name,
      url: source.url,
      type: source.type,
      keywords: source.keywords.join(', '),
      is_active: source.is_active,
    });
    setIsSourceDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;

    try {
      const { error } = await supabase
        .from('veille_techno')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: "Élément supprimé avec succès" });
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSource = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette source ?')) return;

    try {
      const { error } = await supabase
        .from('veille_sources')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: "Source supprimée avec succès" });
      fetchSources();
    } catch (error) {
      console.error('Error deleting source:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      url: "",
      content: "",
      excerpt: "",
      source: "",
      category: "Vulnérabilités",
      keywords: "",
      severity: "",
      cve_id: "",
      published_at: new Date().toISOString().split('T')[0],
      is_featured: false,
      is_active: true,
    });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const resetSourceForm = () => {
    setSourceFormData({
      name: "",
      url: "",
      type: "rss",
      keywords: "",
      is_active: true,
    });
    setEditingSource(null);
    setIsSourceDialogOpen(false);
  };

  if (loading) {
    return <div className="p-6"><div className="animate-pulse">Chargement...</div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion Veille Techno</h2>
          <p className="text-muted-foreground">
            {items.length} éléments • {sources.length} sources actives
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleImportNow} 
            disabled={importing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${importing ? 'animate-spin' : ''}`} />
            {importing ? 'Import...' : 'Importer maintenant'}
          </Button>
          <Dialog open={isSourceDialogOpen} onOpenChange={setIsSourceDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => resetSourceForm()}>
                <Database className="h-4 w-4 mr-2" />
                Gérer les sources
              </Button>
            </DialogTrigger>
          </Dialog>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvel élément
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Sources Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Sources de veille ({sources.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map((source) => (
              <Card key={source.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{source.name}</h4>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEditSource(source)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteSource(source.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant={source.is_active ? "default" : "secondary"}>
                      {source.is_active ? "Actif" : "Inactif"}
                    </Badge>
                    <Badge variant="outline">{source.type}</Badge>
                  </div>
                  {source.last_sync && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(source.last_sync).toLocaleString('fr-FR')}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {source.keywords.length} mots-clés
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="mt-4">
            <Button onClick={() => setIsSourceDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une source
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Éléments de veille</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium line-clamp-1">{item.title}</h3>
                      {item.is_featured && <Badge>Vedette</Badge>}
                      {!item.is_active && <Badge variant="secondary">Inactif</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="outline">{item.category}</Badge>
                      <Badge variant="outline">{item.source}</Badge>
                      {item.severity && (
                        <Badge className={
                          item.severity === 'Critical' ? 'bg-red-500' :
                          item.severity === 'High' ? 'bg-orange-500' :
                          item.severity === 'Medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }>
                          {item.severity}
                        </Badge>
                      )}
                      {item.cve_id && <Badge className="bg-red-500/10 text-red-500">{item.cve_id}</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(item.published_at).toLocaleDateString('fr-FR')} • 
                      {item.keywords.slice(0, 3).join(', ')}
                      {item.keywords.length > 3 && ` (+${item.keywords.length - 3})`}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="ghost" asChild>
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Item Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Modifier l\'élément' : 'Nouvel élément de veille'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="severity">Sévérité</Label>
                <Select value={formData.severity} onValueChange={(value) => setFormData({...formData, severity: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {severities.map((sev) => (
                      <SelectItem key={sev} value={sev}>{sev}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cve_id">CVE ID</Label>
                <Input
                  id="cve_id"
                  value={formData.cve_id}
                  onChange={(e) => setFormData({...formData, cve_id: e.target.value})}
                  placeholder="CVE-2024-..."
                />
              </div>
              <div>
                <Label htmlFor="published_at">Date de publication</Label>
                <Input
                  id="published_at"
                  type="date"
                  value={formData.published_at}
                  onChange={(e) => setFormData({...formData, published_at: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="keywords">Mots-clés (séparés par des virgules)</Label>
              <Input
                id="keywords"
                value={formData.keywords}
                onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                placeholder="RCE, 0-day, Fortinet..."
              />
            </div>

            <div>
              <Label htmlFor="excerpt">Extrait</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="content">Contenu</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows={5}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})}
                />
                <Label htmlFor="is_featured">Élément vedette</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">Actif</Label>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit">
                {editingItem ? 'Mettre à jour' : 'Créer'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Source Form Dialog */}
      <Dialog open={isSourceDialogOpen} onOpenChange={setIsSourceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSource ? 'Modifier la source' : 'Nouvelle source de veille'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSourceSubmit} className="space-y-4">
            <div>
              <Label htmlFor="source_name">Nom de la source</Label>
              <Input
                id="source_name"
                value={sourceFormData.name}
                onChange={(e) => setSourceFormData({...sourceFormData, name: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="source_url">URL</Label>
              <Input
                id="source_url"
                type="url"
                value={sourceFormData.url}
                onChange={(e) => setSourceFormData({...sourceFormData, url: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="source_type">Type</Label>
              <Select value={sourceFormData.type} onValueChange={(value) => setSourceFormData({...sourceFormData, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rss">RSS Feed</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="web">Web Scraping</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="source_keywords">Mots-clés (séparés par des virgules)</Label>
              <Textarea
                id="source_keywords"
                value={sourceFormData.keywords}
                onChange={(e) => setSourceFormData({...sourceFormData, keywords: e.target.value})}
                placeholder="RCE, 0-day, Fortinet, Exchange, Cisco..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="source_active"
                checked={sourceFormData.is_active}
                onCheckedChange={(checked) => setSourceFormData({...sourceFormData, is_active: checked})}
              />
              <Label htmlFor="source_active">Source active</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit">
                {editingSource ? 'Mettre à jour' : 'Créer'}
              </Button>
              <Button type="button" variant="outline" onClick={resetSourceForm}>
                Annuler
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVeille;