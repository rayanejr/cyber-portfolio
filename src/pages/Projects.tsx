import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Github, Eye, Search, Filter } from "lucide-react";

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

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.technologies.some(tech => 
          tech.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by technology
    if (selectedTech !== "all") {
      filtered = filtered.filter(project =>
        project.technologies.some(tech => 
          tech.toLowerCase() === selectedTech.toLowerCase()
        )
      );
    }

    // Sort projects
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

  // Get unique technologies for filter
  const getAllTechnologies = () => {
    const techSet = new Set<string>();
    projects.forEach(project => {
      project.technologies.forEach(tech => techSet.add(tech));
    });
    return Array.from(techSet).sort();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-2/3 sm:w-1/3 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-4/5 sm:w-1/2 mx-auto"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg"></div>
              ))}
            </div>
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
          Mes Projets
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
          Découvrez mes réalisations en cybersécurité, développement web et analyse de sécurité
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 sm:mb-12 space-y-4 sm:space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Rechercher un projet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 cyber-border bg-card/50 backdrop-blur-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-medium">Filtres:</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Technology Filter */}
            <Select value={selectedTech} onValueChange={setSelectedTech}>
              <SelectTrigger className="w-full sm:w-48 cyber-border bg-card/50 backdrop-blur-sm">
                <SelectValue placeholder="Technologie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les technologies</SelectItem>
                {getAllTechnologies().map((tech) => (
                  <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort Filter */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 cyber-border bg-card/50 backdrop-blur-sm">
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
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
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
              className="mt-4"
            >
              Réinitialiser les filtres
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="cyber-border hover:cyber-glow transition-all duration-300 group bg-card/50 backdrop-blur-sm h-full flex flex-col">
              {project.image_url && (
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {project.featured && (
                    <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs">
                      Mis en avant
                    </Badge>
                  )}
                </div>
              )}

              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl font-orbitron cyber-text line-clamp-2">
                  {project.title}
                </CardTitle>
                {project.description && (
                  <p className="text-sm sm:text-base text-muted-foreground line-clamp-3">
                    {project.description}
                  </p>
                )}
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                {/* Technologies */}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {project.technologies.slice(0, 4).map((tech, index) => (
                      <Badge key={index} variant="outline" className="text-xs cyber-border bg-muted/50">
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
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  {/* Détails (route interne) */}
                  <Button asChild size="sm" className="flex-1 min-w-0">
                    <Link to={`/projects/${project.id}`}>
                      <Eye className="w-4 h-4 mr-1.5" />
                      <span className="truncate">Détails</span>
                    </Link>
                  </Button>

                  <div className="flex gap-2">
                    {/* Démo (lien externe) */}
                    {project.demo_url && (
                      <Button asChild size="sm" variant="outline" className="cyber-border bg-card/50">
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span className="sr-only sm:not-sr-only">Démo</span>
                        </a>
                      </Button>
                    )}

                    {/* GitHub (lien externe) */}
                    {project.github_url && (
                      <Button asChild size="sm" variant="outline" className="cyber-border bg-card/50">
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5"
                        >
                          <Github className="w-4 h-4" />
                          <span className="sr-only sm:not-sr-only">Code</span>
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
  );
};

export default Projects;
