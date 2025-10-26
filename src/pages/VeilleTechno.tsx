import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, ExternalLink, RefreshCw, Shield, AlertTriangle, Bug, Database, Cloud, Wrench, FileText, Radio } from "lucide-react";
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
  Critical: "bg-red-500 text-white shadow-lg shadow-red-500/50",
  High: "bg-orange-500 text-white shadow-lg shadow-orange-500/50", 
  Medium: "bg-yellow-500 text-black shadow-lg shadow-yellow-500/50",
  Low: "bg-green-500 text-white shadow-lg shadow-green-500/50",
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
      <div className="min-h-screen bg-background py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-2/3 sm:w-1/3 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-4/5 sm:w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 cyber-grid opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      
      <div className="relative w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20 max-w-screen-2xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-3 h-3 bg-primary rounded-full animate-ping"></div>
            <Radio className="w-10 h-10 text-primary animate-float" />
            <div className="w-3 h-3 bg-accent rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-orbitron font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Veille Techno
            </span>
          </h1>
          
          <div className="relative max-w-3xl mx-auto">
            <p className="text-lg sm:text-xl text-muted-foreground px-4 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
              Actualités, vulnérabilités et menaces en temps réel dans les domaines DevSecOps, Cloud, IA et Infrastructure
            </p>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-8 space-y-6 animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              <Input
                placeholder="Rechercher par titre, contenu ou mots-clés..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 cyber-border bg-card/50 backdrop-blur-sm"
              />
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-52 cyber-border bg-card/50 backdrop-blur-sm">
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
                <SelectTrigger className="w-full sm:w-52 cyber-border bg-card/50 backdrop-blur-sm">
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
              className="btn-cyber w-full lg:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${importing ? 'animate-spin' : ''}`} />
              {importing ? 'Synchronisation...' : 'Actualiser'}
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            {filteredItems.length} élément(s) trouvé(s) • Dernière mise à jour automatique toutes les 2h
          </div>
        </div>

        {/* Veille Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <p className="text-muted-foreground text-lg">
              Aucun élément de veille disponible pour ces critères.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.9s', animationFillMode: 'both' }}>
            {filteredItems.map((item, index) => {
              const CategoryIcon = categories.find(cat => cat.value === item.category)?.icon || Database;
              
              return (
                <Card 
                  key={item.id} 
                  className="cyber-border card-interactive bg-card/50 backdrop-blur-sm h-full flex flex-col group animate-fade-in"
                  style={{ animationDelay: `${1.2 + (index * 0.05)}s`, animationFillMode: 'both' }}
                >
                  <CardHeader className="p-4 sm:p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    
                    <div className="relative flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="h-4 w-4 text-primary" />
                        <Badge variant="outline" className="text-xs cyber-border">
                          {item.category}
                        </Badge>
                      </div>
                      {item.severity && (
                        <Badge className={`text-xs ${severityColors[item.severity as keyof typeof severityColors] || 'bg-gray-500 text-white'} animate-pulse`}>
                          {item.severity}
                        </Badge>
                      )}
                    </div>
                    
                    <CardTitle className="text-lg font-orbitron line-clamp-2 relative group-hover:text-primary transition-colors">
                      {item.title}
                    </CardTitle>
                    
                    {item.excerpt && (
                      <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed mt-2">
                        {item.excerpt}
                      </p>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-4 p-4 sm:p-6 pt-0 mt-auto">
                    {/* Keywords */}
                    {item.keywords && item.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {item.keywords.slice(0, 3).map((keyword, keyIndex) => (
                          <Badge key={keyIndex} variant="secondary" className="text-xs">
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
                      <Badge className="bg-red-500/10 text-red-500 border border-red-500/20 shadow-md">
                        {item.cve_id}
                      </Badge>
                    )}

                    {/* Meta Info */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-full">
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
                    <Button asChild size="sm" className="w-full btn-cyber group/btn">
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2 transition-transform group-hover/btn:translate-x-1" />
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
    </div>
  );
};

export default VeilleTechno;
