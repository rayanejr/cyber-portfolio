
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
      <div className="container mx-auto px-6 py-20">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-muted rounded mb-8"></div>
          <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="container mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Projet non trouvé</h1>
          <p className="text-muted-foreground mb-8">
            Le projet que vous recherchez n'existe pas ou n'est pas disponible.
          </p>
          <Button asChild>
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
    <div className="container mx-auto px-6 py-20">
      {/* Back Button */}
      <Button asChild variant="ghost" className="mb-8">
        <Link to="/projects">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux projets
        </Link>
      </Button>

      <div className="max-w-4xl mx-auto">
        {/* Project Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold font-orbitron text-gradient">
              {project.title}
            </h1>
            {project.featured && (
              <Badge className="bg-primary/90 text-white">
                Projet vedette
              </Badge>
            )}
          </div>
          
          {project.description && (
            <p className="text-xl text-muted-foreground mb-6">
              {project.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(project.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            {project.demo_url && (
              <Button asChild>
                <a 
                  href={project.demo_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Voir la démonstration
                </a>
              </Button>
            )}
            
            {project.github_url && (
              <Button asChild variant="outline">
                <a 
                  href={project.github_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4 mr-2" />
                  Code source
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Project Image */}
        {project.image_url && (
          <div className="mb-12">
            <img 
              src={project.image_url} 
              alt={project.title}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Technologies utilisées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, index) => (
                  <Badge key={index} variant="outline">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Project Content */}
        {project.content && (
          <Card>
            <CardHeader>
              <CardTitle>Description détaillée</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                {project.content.split('\n').map((paragraph, index) => (
                  paragraph.trim() ? (
                    <p key={index} className="mb-4">
                      {paragraph}
                    </p>
                  ) : null
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
