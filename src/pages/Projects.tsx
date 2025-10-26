import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Github, Eye, Search, Filter, FolderGit2, Sparkles } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { getProjectImageUrl } from "@/utils/imageLoader";

interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string;
  demo_url: string;
  github_url: string;
  technologies: string[];
  featured: boolean;
  is_active: boolean;
}

const Projects = () => {
  useDocumentTitle("Projets");
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTech, setSelectedTech] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterAndSortProjects();
  }, [projects, searchTerm, selectedTech, sortBy]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_active', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProjects = () => {
    let filtered = [...projects];

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.technologies.some(tech => 
          tech.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedTech !== "all") {
      filtered = filtered.filter(project =>
        project.technologies.some(tech => 
          tech.toLowerCase() === selectedTech.toLowerCase()
        )
      );
    }

    switch (sortBy) {
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "date":
        filtered.sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime());
        break;
      case "featured":
      default:
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
        break;
    }

    setFilteredProjects(filtered);
  };

  const getAllTechnologies = () => {
    const techSet = new Set<string>();
    projects.forEach(project => {
      project.technologies.forEach(tech => techSet.add(tech));
    });
    return Array.from(techSet).sort();
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
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5"></div>
      
      <div className="relative w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Enhanced Header */}
        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-3 h-3 bg-accent rounded-full animate-ping"></div>
            <FolderGit2 className="w-10 h-10 text-accent animate-float" />
            <div className="w-3 h-3 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-orbitron font-bold mb-6">
            <span className="bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent">
              Mes Projets
            </span>
          </h1>
          
          <div className="relative max-w-3xl mx-auto">
            <p className="text-lg sm:text-xl text-muted-foreground px-4 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
              Découvrez mes réalisations en cybersécurité, développement web et analyse de sécurité
            </p>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-accent to-transparent"></div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 sm:mb-12 space-y-6 animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher un projet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 cyber-border bg-card/50 backdrop-blur-sm h-12 text-base"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground font-medium">Filtres:</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Select value={selectedTech} onValueChange={setSelectedTech}>
                <SelectTrigger className="w-full sm:w-52 cyber-border bg-card/50 backdrop-blur-sm">
                  <SelectValue placeholder="Technologie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les technologies</SelectItem>
                  {getAllTechnologies().map((tech) => (
                    <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-52 cyber-border bg-card/50 backdrop-blur-sm">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Mis en avant</SelectItem>
                  <SelectItem value="title">Nom (A-Z)</SelectItem>
                  <SelectItem value="date">Plus récent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {filteredProjects.length} projet{filteredProjects.length !== 1 ? 's' : ''} trouvé{filteredProjects.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <p className="text-muted-foreground text-lg mb-4">
              {projects.length === 0 ? "Aucun projet disponible pour le moment." : "Aucun projet ne correspond à vos critères de recherche."}
            </p>
            {searchTerm || selectedTech !== "all" ? (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedTech("all");
                  setSortBy("featured");
                }}
                className="btn-ghost-cyber"
              >
                Réinitialiser les filtres
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {filteredProjects.map((project, index) => (
              <Card 
                key={project.id} 
                className="cyber-border card-interactive bg-card/50 backdrop-blur-sm h-full flex flex-col animate-fade-in"
                style={{ 
                  animationDelay: `${0.9 + (index * 0.1)}s`, 
                  animationFillMode: 'both' 
                }}
              >
                {project.image_url ? (
                  <div className="relative overflow-hidden rounded-t-lg">
                    {/* Animated overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                    <img
                      src={getProjectImageUrl(project.image_url)}
                      alt={project.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    {project.featured && (
                      <Badge className="absolute top-3 right-3 bg-gradient-to-r from-accent to-primary text-white shadow-lg shadow-accent/50 z-20">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Mis en avant
                      </Badge>
                    )}
                  </div>
                ) : (
                  <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 h-48 flex items-center justify-center">
                    <FolderGit2 className="w-16 h-16 text-muted-foreground/30" />
                    {project.featured && (
                      <Badge className="absolute top-3 right-3 bg-gradient-to-r from-accent to-primary text-white shadow-lg shadow-accent/50 z-20">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Mis en avant
                      </Badge>
                    )}
                  </div>
                )}

                <CardHeader className="pb-3 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <CardTitle className="text-lg sm:text-xl font-orbitron line-clamp-2 relative group-hover:text-accent transition-colors">
                    {project.title}
                  </CardTitle>
                  {project.description && (
                    <p className="text-sm sm:text-base text-muted-foreground line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="flex-1 flex flex-col justify-between space-y-4 pt-0">
                  {/* Technologies */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.slice(0, 4).map((tech, techIndex) => (
                        <Badge 
                          key={techIndex} 
                          variant="outline" 
                          className="text-xs cyber-border bg-muted/50 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-300 cursor-default"
                        >
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies.length > 4 && (
                        <Badge variant="outline" className="text-xs cyber-border bg-muted/50">
                          +{project.technologies.length - 4}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button asChild size="sm" className="flex-1 btn-cyber">
                      <Link to={`/projects/${project.id}`}>
                        <Eye className="w-4 h-4 mr-1.5" />
                        Détails
                      </Link>
                    </Button>

                    <div className="flex gap-2">
                      {project.demo_url && (
                        <Button asChild size="sm" variant="outline" className="cyber-border bg-card/50 hover:bg-accent/10 hover:border-accent">
                          <a
                            href={project.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}

                      {project.github_url && (
                        <Button asChild size="sm" variant="outline" className="cyber-border bg-card/50 hover:bg-primary/10 hover:border-primary">
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
