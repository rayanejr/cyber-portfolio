import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, GraduationCap, BookOpen, Sparkles } from "lucide-react";

interface Formation {
  id: string;
  title: string;
  institution: string;
  description: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  level: string;
  skills: string[];
}

const Formation = () => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    try {
      const { data, error } = await supabase
        .from('formations')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setFormations(data || []);
    } catch (error) {
      console.error('Error fetching formations:', error);
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
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
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
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
      
      <div className="relative py-12 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
          {/* Enhanced header */}
          <div className="text-center mb-12 sm:mb-16 animate-fade-in">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-3 h-3 bg-primary rounded-full animate-ping"></div>
              <GraduationCap className="w-10 h-10 text-primary animate-float" />
              <div className="w-3 h-3 bg-secondary rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-orbitron font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Formation
              </span>
            </h1>
            
            <div className="relative max-w-3xl mx-auto">
              <p className="text-lg sm:text-xl text-muted-foreground px-4 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                Mon parcours académique et mes certifications en cybersécurité
              </p>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Enhanced Timeline line */}
              <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent opacity-50"></div>
              
              {formations.map((formation, index) => (
                <div 
                  key={formation.id} 
                  className="relative mb-8 sm:mb-12 animate-fade-in group"
                  style={{ 
                    animationDelay: `${0.6 + (index * 0.15)}s`, 
                    animationFillMode: 'both' 
                  }}
                >
                  {/* Enhanced Timeline dot with glow */}
                  <div className="absolute left-4 sm:left-6 w-5 h-5 bg-primary rounded-full border-4 border-background pulse-glow shadow-lg shadow-primary/50 group-hover:scale-125 transition-transform duration-300"></div>
                  
                  <div className="ml-12 sm:ml-20">
                    <Card className="cyber-border card-interactive bg-card/50 backdrop-blur-sm group/card">
                      <CardHeader className="relative overflow-hidden">
                        {/* Animated background on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover/card:translate-x-[100%] transition-transform duration-1000"></div>
                        
                        <div className="relative flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-3 flex items-center gap-2 group-hover/card:text-primary transition-colors">
                              <BookOpen className="w-5 h-5 animate-pulse" />
                              {formation.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-muted-foreground mb-3 group-hover/card:text-foreground transition-colors">
                              <GraduationCap className="w-4 h-4" />
                              <span className="font-medium">{formation.institution}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                              <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span>
                                  {formatDate(formation.start_date)} - {' '}
                                  {formation.is_current ? 'En cours' : 
                                   formation.end_date ? formatDate(formation.end_date) : 'N/A'}
                                </span>
                              </div>
                              {formation.level && (
                                <Badge variant="secondary" className="shadow-md hover:shadow-primary/50 transition-shadow">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  {formation.level}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {formation.is_current && (
                            <Badge className="bg-green-500 text-white shadow-lg shadow-green-500/50 animate-pulse">
                              En cours
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {formation.description && (
                          <p className="text-muted-foreground leading-relaxed group-hover/card:text-foreground transition-colors">
                            {formation.description}
                          </p>
                        )}
                        {formation.skills && formation.skills.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-semibold flex items-center gap-2">
                              <div className="w-1 h-4 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
                              Compétences acquises
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {formation.skills.map((skill, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="outline" 
                                  className="text-xs hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 cursor-default hover:scale-105"
                                  style={{
                                    animationDelay: `${0.8 + (idx * 0.05)}s`,
                                    animationFillMode: 'both'
                                  }}
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
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

export default Formation;
