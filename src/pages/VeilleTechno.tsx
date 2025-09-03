import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, ExternalLink, RefreshCw, Shield, AlertTriangle, Bug, Database, Cloud, Wrench, Eye, FileText } from "lucide-react";
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
}

const categories = [
  { value: "all", label: "Toutes les catégories", icon: Database },
  { value: "Vulnérabilités", label: "Vulnérabilités", icon: Bug },
  { value: "Exploits/PoC", label: "Exploits/PoC", icon: AlertTriangle },
  { value: "Advisories", label: "Advisories", icon: Shield },
  { value: "Malware/Threat", label: "Malware/Threat", icon: Shield },
  { value: "Cloud/Infra", label: "Cloud/Infra", icon: Cloud },
  { value: "Blue Team", label: "Blue Team", icon: Shield },
  { value: "Outils", label: "Outils", icon: Wrench },
  { value: "Lecture longue", label: "Lecture longue", icon: FileText },
];

const severityColors = {
  Critical: "bg-red-500 text-white",
  High: "bg-orange-500 text-white", 
  Medium: "bg-yellow-500 text-black",
  Low: "bg-green-500 text-white",
};

const VeilleTechno = () => {
  const [items, setItems] = useState<VeilleItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<VeilleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");

  const sources = [
    "all", "NVD CVE", "CISA KEV", "CERT-FR", "Microsoft MSRC", 
    "BleepingComputer", "Krebs Security", "Google Project Zero"
  ];

  useEffect(() => {
    fetchVeilleItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, selectedCategory, selectedSource]);

  const fetchVeilleItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('veille_techno')
        .select('*')
        .eq('is_active', true)
        .order('published_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching veille items:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les éléments de veille",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (selectedSource !== "all") {
      filtered = filtered.filter(item => item.source === selectedSource);
    }

    setFilteredItems(filtered);
  };

  const handleManualImport = async () => {
    try {
      setImporting(true);
      const { data, error } = await supabase.functions.invoke('veille-import', {
        body: { manual: true }
      });

      if (error) throw error;

      toast({
        title: "Import réussi",
        description: `${data.imported || 0} nouveaux éléments importés`,
      });

      fetchVeilleItems();
    } catch (error) {
      console.error('Error importing veille:', error);
      toast({
        title: "Erreur d'import",
        description: "Impossible d'importer les données de veille",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-2/3 sm:w-1/3 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-4/5 sm:w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* Header */}
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold font-orbitron mb-4 sm:mb-6 cyber-text">
          Veille Techno Cybersécurité
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
          Actualités, vulnérabilités et menaces en temps réel dans les domaines DevSecOps, Cloud, IA et Infrastructure
        </p>
      </div>

      {/* Controls */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <Input
              placeholder="Rechercher par titre, contenu ou mots-clés..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <cat.icon className="h-4 w-4" />
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                {sources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source === "all" ? "Toutes les sources" : source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleManualImport} 
            disabled={importing}
            className="cyber-border"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${importing ? 'animate-spin' : ''}`} />
            {importing ? 'Import...' : 'Importer maintenant'}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          {filteredItems.length} élément(s) trouvé(s) • Dernière mise à jour automatique toutes les 2h
        </div>
      </div>

      {/* Veille Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            Aucun élément de veille disponible pour ces critères.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item) => {
            const CategoryIcon = categories.find(cat => cat.value === item.category)?.icon || Database;
            
            return (
              <Card key={item.id} className="cyber-border hover:cyber-glow transition-all duration-300 group h-full flex flex-col">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <CategoryIcon className="h-4 w-4 text-primary" />
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    {item.severity && (
                      <Badge className={`text-xs ${severityColors[item.severity as keyof typeof severityColors] || 'bg-gray-500 text-white'}`}>
                        {item.severity}
                      </Badge>
                    )}
                  </div>
                  
                  <CardTitle className="text-lg sm:text-xl font-orbitron text-gradient line-clamp-2">
                    {item.title}
                  </CardTitle>
                  
                  {item.excerpt && (
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {item.excerpt}
                    </p>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4 p-4 sm:p-6 pt-0 mt-auto">
                  {/* Keywords */}
                  {item.keywords && item.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {item.keywords.slice(0, 3).map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {item.keywords.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{item.keywords.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* CVE ID */}
                  {item.cve_id && (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                        {item.cve_id}
                      </Badge>
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {new Date(item.published_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.source}
                    </Badge>
                  </div>
                  
                  {/* Action Button */}
                  <Button asChild size="sm" className="w-full mt-4">
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Lire la source
                    </a>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VeilleTechno;