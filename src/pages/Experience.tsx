import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Building, MapPin, CheckCircle, Briefcase, Sparkles } from "lucide-react";

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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 cyber-grid opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-accent/5"></div>
      
      <div className="relative py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Enhanced header */}
          <div className="text-center mb-12 sm:mb-16 animate-fade-in">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-3 h-3 bg-secondary rounded-full animate-ping"></div>
              <Briefcase className="w-10 h-10 text-secondary animate-float" />
              <div className="w-3 h-3 bg-accent rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-orbitron font-bold mb-6">
              <span className="bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent">
                Expérience
              </span>
            </h1>
            
            <div className="relative max-w-3xl mx-auto">
              <p className="text-lg sm:text-xl text-muted-foreground px-4 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                Mon parcours professionnel en cybersécurité et mes réalisations
              </p>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent"></div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Enhanced Timeline line */}
              <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-secondary via-accent to-primary opacity-50"></div>
              
              {experiences.map((experience, index) => (
                <div 
                  key={experience.id} 
                  className="relative mb-8 sm:mb-12 animate-fade-in group"
                  style={{ 
                    animationDelay: `${0.6 + (index * 0.15)}s`, 
                    animationFillMode: 'both' 
                  }}
                >
                  {/* Enhanced Timeline dot with glow */}
                  <div className="absolute left-4 sm:left-6 w-5 h-5 bg-secondary rounded-full border-4 border-background pulse-glow shadow-lg shadow-secondary/50 group-hover:scale-125 transition-transform duration-300"></div>
                  
                  <div className="ml-12 sm:ml-20">
                    <Card className="cyber-border hover:cyber-glow transition-all duration-500 group/card bg-card/50 backdrop-blur-sm hover:scale-[1.02] hover:-translate-y-1">
                      <CardHeader className="relative overflow-hidden">
                        {/* Animated background on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-secondary/0 via-secondary/5 to-secondary/0 translate-x-[-100%] group-hover/card:translate-x-[100%] transition-transform duration-1000"></div>
                        
                        <div className="relative flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-3 flex items-center gap-2 group-hover/card:text-secondary transition-colors">
                              <Briefcase className="w-5 h-5 animate-pulse" />
                              {experience.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-muted-foreground mb-3 group-hover/card:text-foreground transition-colors">
                              <Building className="w-4 h-4" />
                              <span className="font-medium">{experience.company}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                              <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                                <Calendar className="w-4 h-4 text-secondary" />
                                <span>
                                  {formatDate(experience.start_date)} - {' '}
                                  {experience.is_current ? 'Aujourd\'hui' : 
                                   experience.end_date ? formatDate(experience.end_date) : 'N/A'}
                                </span>
                              </div>
                              {experience.location && (
                                <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                                  <MapPin className="w-4 h-4 text-accent" />
                                  <span>{experience.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {experience.is_current && (
                            <Badge className="bg-success text-success-foreground shadow-lg shadow-success/50 animate-pulse">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Actuel
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {experience.description && (
                          <p className="text-muted-foreground leading-relaxed group-hover/card:text-foreground transition-colors">
                            {experience.description}
                          </p>
                        )}
                        
                        {experience.technologies && experience.technologies.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-semibold flex items-center gap-2">
                              <div className="w-1 h-4 bg-gradient-to-b from-secondary to-accent rounded-full"></div>
                              Technologies utilisées
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {experience.technologies.map((tech, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="outline" 
                                  className="text-xs hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transition-all duration-300 cursor-default hover:scale-105"
                                  style={{
                                    animationDelay: `${0.8 + (idx * 0.05)}s`,
                                    animationFillMode: 'both'
                                  }}
                                >
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {experience.achievements && experience.achievements.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-semibold flex items-center gap-2">
                              <div className="w-1 h-4 bg-gradient-to-b from-accent to-primary rounded-full"></div>
                              Réalisations clés
                            </h4>
                            <ul className="space-y-2">
                              {experience.achievements.map((achievement, idx) => (
                                <li 
                                  key={idx} 
                                  className="flex items-start gap-3 text-sm text-muted-foreground group-hover/card:text-foreground transition-colors animate-fade-in hover:translate-x-1 transition-transform duration-300"
                                  style={{
                                    animationDelay: `${0.9 + (idx * 0.1)}s`,
                                    animationFillMode: 'both'
                                  }}
                                >
                                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0 animate-pulse" />
                                  <span className="leading-relaxed">{achievement}</span>
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
    </div>
  );
};

export default Experience;
