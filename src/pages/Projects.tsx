import { useState } from "react";
import { Search, Filter, Calendar, Github, ExternalLink, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  const projects = [
    {
      id: 1,
      title: "Pentest Infrastructure Bancaire",
      description: "Audit de sécurité complet d'une infrastructure bancaire avec identification de vulnérabilités critiques et recommandations de remédiation.",
      category: "Pentest",
      technologies: ["Python", "Nmap", "Metasploit", "Burp Suite"],
      year: "2024",
      status: "Terminé",
      image: "/placeholder.svg",
      github: "https://github.com/cybersecpro/bank-pentest",
      demo: null
    },
    {
      id: 2,
      title: "SOC Implementation",
      description: "Mise en place d'un Security Operations Center avec détection d'incidents en temps réel et réponse automatisée.",
      category: "SOC",
      technologies: ["Splunk", "ELK Stack", "MITRE ATT&CK", "SOAR"],
      year: "2024",
      status: "En cours",
      image: "/placeholder.svg",
      github: "https://github.com/cybersecpro/soc-implementation",
      demo: "https://demo.cybersecpro.com/soc"
    },
    {
      id: 3,
      title: "Threat Hunting Platform",
      description: "Développement d'une plateforme de chasse aux menaces utilisant l'IA pour la détection proactive des cybermenaces.",
      category: "Threat Hunting",
      technologies: ["Python", "Machine Learning", "Elasticsearch", "Kibana"],
      year: "2023",
      status: "Terminé",
      image: "/placeholder.svg",
      github: "https://github.com/cybersecpro/threat-hunting",
      demo: "https://demo.cybersecpro.com/threat-hunting"
    },
    {
      id: 4,
      title: "Vulnerability Scanner",
      description: "Scanner de vulnérabilités automatisé avec reporting détaillé et intégration CI/CD.",
      category: "Sécurité",
      technologies: ["Go", "Docker", "API REST", "PostgreSQL"],
      year: "2023",
      status: "Terminé",
      image: "/placeholder.svg",
      github: "https://github.com/cybersecpro/vuln-scanner",
      demo: null
    },
    {
      id: 5,
      title: "Incident Response Tool",
      description: "Outil de réponse aux incidents avec workflow automatisé et intégration SIEM.",
      category: "Incident Response",
      technologies: ["React", "Node.js", "MongoDB", "WebSocket"],
      year: "2023",
      status: "Maintenance",
      image: "/placeholder.svg",
      github: "https://github.com/cybersecpro/incident-response",
      demo: "https://demo.cybersecpro.com/incident"
    },
    {
      id: 6,
      title: "Malware Analysis Lab",
      description: "Environnement d'analyse de malware avec sandboxing et analyse comportementale.",
      category: "Malware Analysis",
      technologies: ["Python", "Cuckoo", "YARA", "VirusTotal API"],
      year: "2022",
      status: "Terminé",
      image: "/placeholder.svg",
      github: "https://github.com/cybersecpro/malware-lab",
      demo: null
    }
  ];

  const categories = [
    "all",
    "Pentest",
    "SOC",
    "Threat Hunting",
    "Sécurité",
    "Incident Response",
    "Malware Analysis"
  ];

  const years = ["all", "2024", "2023", "2022"];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || project.category === selectedCategory;
    const matchesYear = selectedYear === "all" || project.year === selectedYear;
    
    return matchesSearch && matchesCategory && matchesYear;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Terminé": return "default";
      case "En cours": return "secondary";
      case "Maintenance": return "outline";
      default: return "default";
    }
  };

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 fade-in">
          <h1 className="text-4xl md:text-5xl font-orbitron font-bold mb-4">
            Mes <span className="cyber-text">Projets</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Découvrez mes projets en cybersécurité, du pentesting aux outils de défense,
            en passant par la recherche de menaces et l'analyse de malware.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card/50 cyber-border rounded-lg p-6 mb-12 fade-in fade-in-delay-1">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par titre, description ou technologie..."
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
            {filteredProjects.length} projet(s) trouvé(s)
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <Card key={project.id} className={`cyber-border hover:cyber-glow transition-all duration-300 fade-in fade-in-delay-${index % 3 + 1}`}>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={getStatusBadgeVariant(project.status)}>
                    {project.status}
                  </Badge>
                  <Badge variant="outline">{project.year}</Badge>
                </div>
                <CardTitle className="text-xl">{project.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {project.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Category */}
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Tag className="h-4 w-4 mr-2" />
                    {project.category}
                  </div>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Link to={`/projects/${project.id}`} className="flex-1">
                      <Button size="sm" className="btn-cyber w-full">
                        Voir plus
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    
                    {project.github && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(project.github, '_blank')}
                        className="btn-ghost-cyber"
                      >
                        <Github className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No results */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="text-muted-foreground mb-4">
                <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Aucun projet trouvé</h3>
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