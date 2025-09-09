import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { 
  ArrowRight, 
  ChevronRight, 
  Shield, 
  Lock, 
  Eye, 
  Download,
  ExternalLink,
  MapPin,
  Calendar
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import CVDownloadButton from "@/components/CVDownloadButton";
import CertificationViewer from "@/components/CertificationViewer";
import SkillsSection from "@/components/SkillsSection";
import AnimatedSection from "@/components/AnimatedSection";

// Fallback images pour les projets
const projectFallbacks = [
  "/src/assets/project-security.jpg",
  "/src/assets/project-soc.jpg", 
  "/src/assets/project-threat.jpg"
];

const Home = () => {
  // États pour les données dynamiques
  const [skills, setSkills] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [selectedCertification, setSelectedCertification] = useState<any>(null);

  // Animation typewriter pour le rôle
  const roles = [
    "Expert en Cybersécurité",
    "Développeur Sécurisé", 
    "Consultant en Sécurité",
    "Analyste SOC"
  ];
  const [currentRole, setCurrentRole] = useState("");
  const [roleIndex, setRoleIndex] = useState(0);

  // Effet typewriter
  useEffect(() => {
    const role = roles[roleIndex];
    let charIndex = 0;
    
    const typeInterval = setInterval(() => {
      if (charIndex < role.length) {
        setCurrentRole(role.substring(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setRoleIndex((prev) => (prev + 1) % roles.length);
          setCurrentRole("");
        }, 2000);
      }
    }, 150);

    return () => clearInterval(typeInterval);
  }, [roleIndex, roles]);

  // Fonctions utilitaires
  const safeParseArray = (value: any): string[] => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return value.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const isAllowedAsset = (url: string): boolean => {
    if (!url) return false;
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const extension = url.toLowerCase().substring(url.lastIndexOf('.'));
    return allowedExtensions.includes(extension);
  };

  // Chargement des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Compétences groupées par catégorie
        const { data: skillsData } = await supabase
          .from('skills')
          .select('*')
          .order('category', { ascending: true });

        if (skillsData) {
          const groupedSkills = skillsData.reduce((acc: any, skill: any) => {
            const category = skill.category || 'Autres';
            if (!acc[category]) {
              acc[category] = { category, items: [] };
            }
            acc[category].items.push(skill.name);
            return acc;
          }, {});

          setSkills(Object.values(groupedSkills));
        }

        // Certifications actives
        const { data: certsData } = await supabase
          .from('certifications')
          .select('*')
          .eq('is_active', true)
          .order('issue_date', { ascending: false })
          .limit(6);

        if (certsData) {
          setCertifications(certsData);
        }

        // Projets récents
        const { data: projectsData } = await supabase
          .from('projects')
          .select('*')
          .eq('is_active', true)
          .eq('featured', true)
          .order('created_at', { ascending: false })
          .limit(6);

        if (projectsData) {
          setRecentProjects(projectsData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section - Gardé identique */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 particles"></div>
        <div className="absolute inset-0 cyber-grid opacity-30"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection animation="fade-in" delay={200}>
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden cyber-border animate-glow-pulse">
                <img
                  src="/src/assets/profile-photo.jpg"
                  alt="Rayane Jerbi - Expert en Cybersécurité"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="slide-up" delay={400}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-orbitron font-bold mb-6">
              Rayane <span className="cyber-text">Jerbi</span>
            </h1>
          </AnimatedSection>

          <AnimatedSection animation="fade-in" delay={600}>
            <div className="text-xl sm:text-2xl md:text-3xl mb-8 font-orbitron">
              <span className="typing-text">
                {currentRole}
              </span>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fade-in-left" delay={800}>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
              Expert en <span className="text-primary font-semibold">cybersécurité</span> et 
              <span className="text-secondary font-semibold"> développement sécurisé</span>, 
              spécialisé dans la protection des infrastructures critiques et la mise en place 
              de solutions de sécurité robustes.
            </p>
          </AnimatedSection>

          <AnimatedSection animation="scale-in" delay={1000}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/projects">
                <Button className="btn-cyber group text-lg px-8 py-4 hover-lift">
                  <Shield className="mr-2 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                  Découvrir mes projets
                  <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>

              <CVDownloadButton />

              <Link to="/contact">
                <Button variant="outline" className="btn-ghost-cyber text-lg px-8 py-4 hover-lift">
                  Me contacter
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>

        <AnimatedSection 
          animation="fade-in" 
          delay={1200}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="animate-bounce">
            <ChevronRight className="h-6 w-6 text-primary rotate-90" />
          </div>
        </AnimatedSection>
      </section>

      {/* À propos - Gardé identique */}
      <section className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection animation="fade-in-left" delay={200}>
              <div>
                <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-6">
                  À propos de <span className="cyber-text">moi</span>
                </h2>
                <div className="space-y-6 text-lg text-muted-foreground">
                  <p className="leading-relaxed">
                    Passionné par la <span className="text-primary font-semibold">cybersécurité</span> depuis mes débuts 
                    en informatique, je me spécialise dans la protection des systèmes d'information 
                    et le développement de solutions sécurisées.
                  </p>
                  <p className="leading-relaxed">
                    Mon expertise couvre l'<span className="text-secondary font-semibold">analyse de vulnérabilités</span>, 
                    la mise en place d'infrastructures sécurisées, et la sensibilisation aux bonnes 
                    pratiques de sécurité informatique.
                  </p>
                  <p className="leading-relaxed">
                    Je combine une approche technique rigoureuse avec une vision stratégique 
                    pour offrir des solutions de sécurité adaptées aux enjeux actuels.
                  </p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-in-right" delay={400}>
              <div className="relative">
                <div className="cyber-border rounded-2xl p-8 bg-gradient-card hover-glow">
                  <h3 className="text-xl font-orbitron font-bold mb-6 text-center">
                    Mes <span className="cyber-text">statistiques</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-orbitron font-bold text-primary mb-2">5+</div>
                      <div className="text-sm text-muted-foreground">Années d'expérience</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-orbitron font-bold text-secondary mb-2">20+</div>
                      <div className="text-sm text-muted-foreground">Projets réalisés</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-orbitron font-bold text-accent mb-2">15+</div>
                      <div className="text-sm text-muted-foreground">Technologies maîtrisées</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-orbitron font-bold text-primary mb-2">100%</div>
                      <div className="text-sm text-muted-foreground">Sécurité prioritaire</div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Compétences sans barres de progression */}
      <SkillsSection skills={skills} />

      {/* Projets récents - Gardés identiques */}
      <section className="py-20 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 particles opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection className="flex justify-between items-center mb-10">
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold">
              Projets <span className="cyber-text">récents</span>
            </h2>
            <Link to="/projects">
              <Button variant="outline" className="btn-ghost-cyber hover-lift">
                Tous les projets
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {recentProjects.length === 0 ? (
              <AnimatedSection animation="scale-in">
                <Card className="cyber-border col-span-full text-center">
                  <CardContent className="p-10">
                    <p className="text-muted-foreground">Aucun projet récent pour le moment.</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ) : (
              recentProjects.map((p, idx) => {
                const imgSrc = String(p.image_url || projectFallbacks[idx % projectFallbacks.length]);
                const techs = safeParseArray(p.technologies);

                return (
                  <AnimatedSection 
                    key={p.id} 
                    animation="scale-in" 
                    delay={idx * 100}
                    className="group"
                  >
                    <Card className="cyber-border hover:cyber-glow transition-all duration-500 h-full hover-lift">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <AspectRatio ratio={16 / 9}>
                          <img
                            src={imgSrc}
                            alt={p.title}
                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                          />
                        </AspectRatio>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>

                      <CardContent className="p-6">
                        <h3 className="text-xl font-orbitron font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                          {p.title}
                        </h3>
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {p.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {techs.slice(0, 3).map((tech: string) => (
                            <Badge 
                              key={tech} 
                              variant="secondary" 
                              className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors duration-200"
                            >
                              {tech}
                            </Badge>
                          ))}
                          {techs.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{techs.length - 3}
                            </Badge>
                          )}
                        </div>

                        <Link to={`/projects/${p.id}`}>
                          <Button className="w-full btn-ghost-cyber group/btn">
                            <Eye className="mr-2 h-4 w-4 group-hover/btn:scale-110 transition-transform duration-200" />
                            Voir le projet
                            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </AnimatedSection>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Certifications - Gardées identiques */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4">
              Certifications <span className="cyber-text">Professionnelles</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Mes certifications reconnues dans le domaine de la cybersécurité
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {certifications.length === 0 ? (
              <AnimatedSection animation="scale-in">
                <Card className="cyber-border col-span-full text-center">
                  <CardContent className="p-10">
                    <p className="text-muted-foreground">Aucune certification pour le moment.</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ) : (
              certifications.map((cert, idx) => (
                <AnimatedSection 
                  key={cert.id} 
                  animation="scale-in" 
                  delay={idx * 150}
                  className="group"
                >
                  <Card className="cyber-border hover:cyber-glow transition-all duration-500 h-full hover-lift cursor-pointer"
                        onClick={() => setSelectedCertification(cert)}>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-orbitron font-bold group-hover:text-primary transition-colors duration-300">
                        {cert.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium text-secondary">{cert.issuer}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(cert.issue_date).getFullYear()}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {cert.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {cert.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="secondary" 
                          className="bg-primary/10 text-primary border-primary/20"
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          Certifié
                        </Badge>
                        {cert.credential_url && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(cert.credential_url, '_blank');
                            }}
                            className="text-xs hover:text-primary"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Voir
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Contact - Gardé identique */}
      <section className="py-20 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 particles opacity-30"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <AnimatedSection animation="fade-in" delay={200}>
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-6">
              Collaborons <span className="cyber-text">ensemble</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Besoin d'expertise en cybersécurité ? Contactez-moi pour discuter de vos projets
              et découvrir comment je peux renforcer la sécurité de votre infrastructure.
            </p>
          </AnimatedSection>

          <AnimatedSection animation="scale-in" delay={400}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/contact">
                <Button className="btn-cyber group text-lg px-8 py-4 hover-lift">
                  <Lock className="mr-2 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                  Contactez-moi
                  <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>

              <CVDownloadButton />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Certification Viewer Modal */}
      <CertificationViewer 
        isOpen={!!selectedCertification}
        certification={selectedCertification}
        onClose={() => setSelectedCertification(null)}
      />
    </div>
  );
};

export default Home;