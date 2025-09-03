import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Eye } from "lucide-react";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

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

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-20">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-20">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold font-orbitron mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Mes Projets
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Découvrez mes réalisations en cybersécurité, développement web et analyse de sécurité
        </p>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            Aucun projet disponible pour le moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {projects.map((project) => (
            <Card key={project.id} className="cyber-border hover:shadow-cyber transition-all duration-300 group">
              {project.image_url && (
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {project.featured && (
                    <Badge className="absolute top-4 left-4 bg-primary/90 text-white">
                      Mis en avant
                    </Badge>
                  )}
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-xl font-orbitron text-gradient">
                  {project.title}
                </CardTitle>
                {project.description && (
                  <p className="text-muted-foreground">
                    {project.description}
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Technologies */}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  {/* Détails (route interne) */}
                  <Button asChild size="sm" className="flex-1">
                    <Link to={`/projects/${project.id}`}>
                      <Eye className="w-4 h-4 mr-2" />
                      Détails
                    </Link>
                  </Button>

                  {/* Démo (lien externe) */}
                  {project.demo_url && (
                    <Button asChild size="sm" variant="outline">
                      <a
                        href={project.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="sr-only">Démo</span>
                      </a>
                    </Button>
                  )}

                  {/* GitHub (lien externe) */}
                  {project.github_url && (
                    <Button asChild size="sm" variant="outline">
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2"
                      >
                        <Github className="w-4 h-4" />
                        <span className="sr-only">Code</span>
                      </a>
                    </Button>
                  )}
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
