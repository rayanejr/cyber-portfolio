import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, GraduationCap, MapPin } from "lucide-react";

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
      <div className="min-h-screen bg-background py-20">
        <div className="container mx-auto px-6">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Formation
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Mon parcours académique et mes certifications en cybersécurité
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>
            
            {formations.map((formation, index) => (
              <div key={formation.id} className="relative mb-12">
                {/* Timeline dot */}
                <div className="absolute left-6 w-4 h-4 bg-primary rounded-full border-4 border-background"></div>
                
                <div className="ml-20">
                  <Card className="hover:shadow-cyber transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl mb-2">{formation.title}</CardTitle>
                          <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <GraduationCap className="w-4 h-4" />
                            <span>{formation.institution}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {formatDate(formation.start_date)} - {' '}
                                {formation.is_current ? 'En cours' : 
                                 formation.end_date ? formatDate(formation.end_date) : 'N/A'}
                              </span>
                            </div>
                            {formation.level && (
                              <Badge variant="secondary">{formation.level}</Badge>
                            )}
                          </div>
                        </div>
                        {formation.is_current && (
                          <Badge className="bg-success text-success-foreground">En cours</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {formation.description && (
                        <p className="text-muted-foreground mb-4">{formation.description}</p>
                      )}
                      {formation.skills && formation.skills.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Compétences acquises :</h4>
                          <div className="flex flex-wrap gap-2">
                            {formation.skills.map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
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
  );
};

export default Formation;