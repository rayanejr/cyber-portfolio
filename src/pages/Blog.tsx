import { useState } from "react";
import { Search, Filter, Calendar, Clock, User, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  const articles = [
    {
      id: 1,
      title: "Les Nouvelles Techniques de Phishing en 2024",
      excerpt: "Analyse des dernières méthodes utilisées par les cybercriminels pour tromper les utilisateurs et comment s'en protéger efficacement.",
      content: "Le phishing évolue constamment...",
      category: "Phishing",
      tags: ["Phishing", "Social Engineering", "Prévention"],
      date: "2024-03-15",
      readTime: "8 min",
      author: "CyberSecPro",
      image: "/placeholder.svg",
      featured: true
    },
    {
      id: 2,
      title: "MITRE ATT&CK : Guide Complet pour les SOC",
      excerpt: "Comment utiliser efficacement le framework MITRE ATT&CK pour améliorer la détection et la réponse aux incidents.",
      content: "Le framework MITRE ATT&CK...",
      category: "SOC",
      tags: ["MITRE ATT&CK", "SOC", "Threat Hunting"],
      date: "2024-03-10",
      readTime: "12 min",
      author: "CyberSecPro",
      image: "/placeholder.svg",
      featured: false
    },
    {
      id: 3,
      title: "Automatisation de la Réponse aux Incidents avec SOAR",
      excerpt: "Les meilleures pratiques pour implémenter une solution SOAR et automatiser efficacement la réponse aux incidents.",
      content: "L'automatisation SOAR...",
      category: "Incident Response",
      tags: ["SOAR", "Automatisation", "Incident Response"],
      date: "2024-03-05",
      readTime: "10 min",
      author: "CyberSecPro",
      image: "/placeholder.svg",
      featured: true
    },
    {
      id: 4,
      title: "Sécurisation des API : Vulnérabilités Communes",
      excerpt: "Tour d'horizon des vulnérabilités les plus fréquentes dans les API modernes et techniques de sécurisation.",
      content: "Les API sont devenues...",
      category: "Sécurité Web",
      tags: ["API Security", "OWASP", "Pentest"],
      date: "2024-02-28",
      readTime: "15 min",
      author: "CyberSecPro",
      image: "/placeholder.svg",
      featured: false
    },
    {
      id: 5,
      title: "Intelligence Artificielle et Cybersécurité",
      excerpt: "Comment l'IA révolutionne la détection des menaces et l'analyse comportementale en cybersécurité.",
      content: "L'intelligence artificielle...",
      category: "IA Security",
      tags: ["IA", "Machine Learning", "Threat Detection"],
      date: "2024-02-20",
      readTime: "20 min",
      author: "CyberSecPro",
      image: "/placeholder.svg",
      featured: true
    },
    {
      id: 6,
      title: "Pentest Mobile : Méthodologie Complète",
      excerpt: "Guide détaillé pour mener un pentest d'application mobile efficace sur iOS et Android.",
      content: "Le pentest mobile...",
      category: "Pentest",
      tags: ["Mobile Security", "Pentest", "iOS", "Android"],
      date: "2024-02-15",
      readTime: "18 min",
      author: "CyberSecPro",
      image: "/placeholder.svg",
      featured: false
    }
  ];

  const categories = [
    "all",
    "Phishing",
    "SOC", 
    "Incident Response",
    "Sécurité Web",
    "IA Security",
    "Pentest"
  ];

  const years = ["all", "2024", "2023", "2022"];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    const matchesYear = selectedYear === "all" || article.date.startsWith(selectedYear);
    
    return matchesSearch && matchesCategory && matchesYear;
  });

  const featuredArticles = filteredArticles.filter(article => article.featured);
  const regularArticles = filteredArticles.filter(article => !article.featured);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 fade-in">
          <h1 className="text-4xl md:text-5xl font-orbitron font-bold mb-4">
            Blog <span className="cyber-text">Cybersécurité</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Découvrez mes analyses, tutoriels et retours d'expérience sur les dernières 
            tendances en cybersécurité, threats intelligence et sécurité défensive.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card/50 cyber-border rounded-lg p-6 mb-12 fade-in fade-in-delay-1">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par titre, contenu ou tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "Toutes les catégories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Année" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>
                      {year === "all" ? "Toutes" : year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            {filteredArticles.length} article(s) trouvé(s)
          </div>
        </div>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-orbitron font-bold mb-8 fade-in fade-in-delay-2">
              Articles en Vedette
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredArticles.map((article, index) => (
                <Card key={article.id} className={`cyber-border hover:cyber-glow transition-all duration-300 fade-in fade-in-delay-${index % 3 + 1}`}>
                  <CardHeader>
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                    
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="default" className="bg-primary/20 text-primary">
                        En vedette
                      </Badge>
                      <Badge variant="outline">{article.category}</Badge>
                    </div>
                    
                    <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {article.excerpt}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Meta info */}
                      <div className="flex items-center text-sm text-muted-foreground space-x-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(article.date)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {article.readTime}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {article.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Read more */}
                      <div className="pt-4">
                        <Link to={`/blog/${article.id}`}>
                          <Button size="sm" className="btn-cyber w-full group">
                            Lire la suite
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Regular Articles */}
        {regularArticles.length > 0 && (
          <div>
            <h2 className="text-2xl font-orbitron font-bold mb-8 fade-in fade-in-delay-1">
              Tous les Articles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularArticles.map((article, index) => (
                <Card key={article.id} className={`cyber-border hover:cyber-glow transition-all duration-300 fade-in fade-in-delay-${index % 3 + 1}`}>
                  <CardHeader>
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                    
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{article.category}</Badge>
                    </div>
                    
                    <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {article.excerpt}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Meta info */}
                      <div className="flex items-center text-sm text-muted-foreground space-x-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(article.date)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {article.readTime}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {article.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Read more */}
                      <Link to={`/blog/${article.id}`}>
                        <Button variant="outline" size="sm" className="btn-ghost-cyber w-full group">
                          Lire la suite
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="text-muted-foreground mb-4">
                <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Aucun article trouvé</h3>
              <p className="text-muted-foreground mb-4">
                Essayez de modifier vos critères de recherche ou filtres.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedYear("all");
                }}
                className="btn-ghost-cyber"
              >
                Réinitialiser les filtres
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}