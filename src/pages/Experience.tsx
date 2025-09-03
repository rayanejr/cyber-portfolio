import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Building, MapPin, CheckCircle } from "lucide-react";

interface Experience {
  id: string;
  title: string;
  company: string;
  description: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  location: string;
  technologies: string[];
  achievements: string[];
}

const Experience = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setExperiences(data || []);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric'
    });
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
    <div className="min-h-screen bg-background py-12 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 cyber-text">
            Expérience
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Mon parcours professionnel en cybersécurité et mes réalisations
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-border"></div>
            
            {experiences.map((experience, index) => (
              <div key={experience.id} className="relative mb-8 sm:mb-12">
                {/* Timeline dot */}
                <div className="absolute left-4 sm:left-6 w-4 h-4 bg-primary rounded-full border-4 border-background"></div>
                
                <div className="ml-12 sm:ml-20">
                  <Card className="cyber-border hover:cyber-glow transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl mb-2">{experience.title}</CardTitle>
                          <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <Building className="w-4 h-4" />
                            <span>{experience.company}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {formatDate(experience.start_date)} - {' '}
                                {experience.is_current ? 'Aujourd\'hui' : 
                                 experience.end_date ? formatDate(experience.end_date) : 'N/A'}
                              </span>
                            </div>
                            {experience.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{experience.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {experience.is_current && (
                          <Badge className="bg-success text-success-foreground">Actuel</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {experience.description && (
                        <p className="text-muted-foreground">{experience.description}</p>
                      )}
                      
                      {experience.technologies && experience.technologies.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Technologies utilisées :</h4>
                          <div className="flex flex-wrap gap-2">
                            {experience.technologies.map((tech, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {experience.achievements && experience.achievements.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Réalisations clés :</h4>
                          <ul className="space-y-1">
                            {experience.achievements.map((achievement, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                <span>{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Experience;