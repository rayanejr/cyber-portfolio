
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, ArrowLeft, Calendar } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url: string;
  demo_url: string;
  github_url: string;
  technologies: string[];
  featured: boolean;
  is_active: boolean;
  created_at: string;
}

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id]);

  const fetchProject = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setNotFound(true);
        } else {
          throw error;
        }
      } else {
        setProject(data);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-3/4 sm:w-1/4 mb-6 sm:mb-8"></div>
          <div className="h-48 sm:h-64 bg-muted rounded mb-6 sm:mb-8"></div>
          <div className="h-4 bg-muted rounded w-full sm:w-3/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-3/4 sm:w-1/2"></div>
        </div>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 cyber-text">Projet non trouvé</h1>
          <p className="text-muted-foreground mb-6 sm:mb-8 text-base sm:text-lg">
            Le projet que vous recherchez n'existe pas ou n'est pas disponible.
          </p>
          <Button asChild className="btn-cyber">
            <Link to="/projects">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux projets
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* Back Button */}
      <Button asChild variant="ghost" className="mb-6 sm:mb-8 cyber-border">
        <Link to="/projects">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Retour aux projets</span>
          <span className="sm:hidden">Retour</span>
        </Link>
      </Button>

      <div className="max-w-4xl mx-auto">
        {/* Project Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-start sm:gap-2 mb-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-orbitron cyber-text mb-2 sm:mb-0 flex-1">
              {project.title}
            </h1>
            {project.featured && (
              <Badge className="bg-primary/90 text-white self-start">
                Projet vedette
              </Badge>
            )}
          </div>
          
          {project.description && (
            <p className="text-lg sm:text-xl text-muted-foreground mb-4 sm:mb-6">
              {project.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 sm:mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-xs sm:text-sm">
                {new Date(project.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
            {project.demo_url && (
              <Button asChild className="btn-cyber">
                <a 
                  href={project.demo_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Voir la démonstration</span>
                  <span className="sm:hidden">Démo</span>
                </a>
              </Button>
            )}
            
            {project.github_url && (
              <Button asChild variant="outline" className="cyber-border">
                <a 
                  href={project.github_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Code source</span>
                  <span className="sm:hidden">Code</span>
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Project Image */}
        {project.image_url && (
          <div className="mb-8 sm:mb-12">
            <img 
              src={project.image_url} 
              alt={project.title}
              className="w-full rounded-lg shadow-lg cyber-border"
            />
          </div>
        )}

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <Card className="mb-8 sm:mb-12 cyber-border">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Technologies utilisées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, index) => (
                  <Badge key={index} variant="outline" className="text-xs sm:text-sm cyber-border">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Project Content */}
        {project.content && (
          <Card className="cyber-border">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Description détaillée</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-sm sm:text-base">
                  {project.content}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
