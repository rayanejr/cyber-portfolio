import { useState, useEffect } from "react";
import { ArrowRight, Shield, Target, Code, Award, ExternalLink, ChevronRight, Eye, Download, Mail, Phone, MapPin, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/cyber-hero.jpg";
import profilePhoto from "@/assets/profile-photo.jpg";
import projectSecurity from "@/assets/project-security.jpg";
import projectSoc from "@/assets/project-soc.jpg";
import projectThreat from "@/assets/project-threat.jpg";

export default function Home() {
  const [skills, setSkills] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const { toast } = useToast();

  const projectImages = [projectSecurity, projectSoc, projectThreat];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch skills grouped by category
      const { data: skillsData } = await supabase
        .from('skills')
        .select('*')
        .eq('is_featured', true)
        .order('category', { ascending: true });

      // Group skills by category
      const groupedSkills = skillsData?.reduce((acc: any, skill: any) => {
        const existing = acc.find((group: any) => group.category === skill.category);
        if (existing) {
          existing.items.push(skill.name);
        } else {
          acc.push({
            category: skill.category,
            items: [skill.name]
          });
        }
        return acc;
      }, []) || [];

      setSkills(groupedSkills);

      // Fetch certifications
      const { data: certsData } = await supabase
        .from('certifications')
        .select('*')
        .eq('is_active', true)
        .order('issue_date', { ascending: false })
        .limit(4);

      setCertifications(certsData || []);

      // Mock recent projects with images
      const mockProjects = [
        {
          id: 1,
          title: "Pentest Infrastructure Bancaire",
          description: "Audit de sécurité complet d'une infrastructure bancaire avec identification de vulnérabilités critiques.",
          tech: ["Python", "Nmap", "Metasploit"],
          date: "2024",
          image: projectSecurity
        },
        {
          id: 2,
          title: "SOC Implementation",
          description: "Mise en place d'un Security Operations Center avec détection d'incidents en temps réel.",
          tech: ["Splunk", "ELK Stack", "MITRE ATT&CK"],
          date: "2024",
          image: projectSoc
        },
        {
          id: 3,
          title: "Threat Hunting Platform",
          description: "Développement d'une plateforme de chasse aux menaces avec IA pour la détection proactive.",
          tech: ["Python", "Machine Learning", "Elasticsearch"],
          date: "2023",
          image: projectThreat
        }
      ];

      setRecentProjects(mockProjects);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const viewCertification = (cert: any) => {
    if (cert.pdf_url) {
      window.open(cert.pdf_url, '_blank');
    } else if (cert.image_url) {
      window.open(cert.image_url, '_blank');
    } else if (cert.credential_url) {
      window.open(cert.credential_url, '_blank');
    } else {
      toast({
        title: "Certification non disponible",
        description: "Le document de certification n'est pas disponible pour le moment.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${heroImage})` }}
        ></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="fade-in">
              <h1 className="text-4xl md:text-6xl font-orbitron font-bold mb-6">
                Expert en <span className="cyber-text">Cybersécurité</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Spécialisé dans la sécurité offensive et défensive, 
                je protège vos infrastructures contre les menaces cyber modernes.
              </p>
            </div>
            
            <div className="fade-in fade-in-delay-1 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/projects">
                <Button size="lg" className="btn-cyber group">
                  Découvrir mes projets
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="btn-ghost-cyber">
                  Me contacter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4">
              À Propos
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Photo et info */}
            <div className="text-center lg:text-left fade-in fade-in-delay-1">
              <div className="relative inline-block mb-6">
                <img 
                  src={profilePhoto} 
                  alt="Expert en Cybersécurité" 
                  className="w-64 h-64 rounded-full mx-auto lg:mx-0 object-cover cyber-border hover:cyber-glow transition-all duration-300"
                />
                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2">
                  <Shield className="h-6 w-6" />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-orbitron font-bold">Expert Cybersécurité</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Passionné par la cybersécurité depuis plus de 8 ans, je combine expertise technique 
                  et vision stratégique pour aider les entreprises à sécuriser leurs infrastructures 
                  critiques. Mon approche holistique englobe la sécurité offensive, défensive et 
                  la gouvernance des risques cyber.
                </p>
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  <Badge variant="secondary" className="text-sm">8+ ans d'expérience</Badge>
                  <Badge variant="secondary" className="text-sm">100+ audits réalisés</Badge>
                  <Badge variant="secondary" className="text-sm">Expert certifié</Badge>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-6 fade-in fade-in-delay-2">
              <Card className="cyber-border text-center p-6 hover:cyber-glow transition-all duration-300">
                <div className="text-3xl font-orbitron font-bold cyber-text mb-2">150+</div>
                <div className="text-sm text-muted-foreground">Projets réalisés</div>
              </Card>
              <Card className="cyber-border text-center p-6 hover:cyber-glow transition-all duration-300">
                <div className="text-3xl font-orbitron font-bold cyber-text mb-2">50+</div>
                <div className="text-sm text-muted-foreground">Entreprises protégées</div>
              </Card>
              <Card className="cyber-border text-center p-6 hover:cyber-glow transition-all duration-300">
                <div className="text-3xl font-orbitron font-bold cyber-text mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">Support disponible</div>
              </Card>
              <Card className="cyber-border text-center p-6 hover:cyber-glow transition-all duration-300">
                <div className="text-3xl font-orbitron font-bold cyber-text mb-2">99.9%</div>
                <div className="text-sm text-muted-foreground">Taux de satisfaction</div>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="cyber-border hover:cyber-glow transition-all duration-300 fade-in fade-in-delay-1">
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Sécurité Défensive</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Mise en place de SOC, SIEM, stratégies de détection d'incidents et réponse aux menaces en temps réel.
                </p>
              </CardContent>
            </Card>

            <Card className="cyber-border hover:cyber-glow transition-all duration-300 fade-in fade-in-delay-2">
              <CardHeader>
                <Target className="h-10 w-10 text-secondary mb-2" />
                <CardTitle>Sécurité Offensive</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Pentests avancés, red team, audits de sécurité et évaluations de vulnérabilités critiques.
                </p>
              </CardContent>
            </Card>

            <Card className="cyber-border hover:cyber-glow transition-all duration-300 fade-in fade-in-delay-3">
              <CardHeader>
                <Code className="h-10 w-10 text-accent mb-2" />
                <CardTitle>Développement Sécurisé</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Création d'outils de sécurité sur mesure et intégration de bonnes pratiques DevSecOps.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Skills Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4">
              Compétences <span className="cyber-text">Techniques</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Une expertise complète couvrant tous les aspects de la cybersécurité moderne
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {skills.map((skillGroup, index) => (
              <Card key={skillGroup.category} className={`cyber-border hover:cyber-glow transition-all duration-300 fade-in fade-in-delay-${index + 1}`}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                    {skillGroup.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {skillGroup.items.map((skill: string) => (
                      <div key={skill} className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                        <div className="w-2 h-2 bg-secondary rounded-full opacity-60"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Projects with Images */}
      <section className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-16 fade-in">
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold">
              Projets <span className="cyber-text">Récents</span>
            </h2>
            <Link to="/projects">
              <Button variant="outline" className="btn-ghost-cyber">
                Voir tous les projets
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentProjects.map((project, index) => (
              <Card key={project.id} className={`cyber-border hover:cyber-glow transition-all duration-300 fade-in fade-in-delay-${index + 1} overflow-hidden`}>
                {/* Project Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent"></div>
                  <Badge className="absolute top-4 right-4 bg-primary/90">
                    {project.date}
                  </Badge>
                </div>

                <CardHeader>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech: string) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <Link to={`/projects/${project.id}`}>
                      <Button size="sm" className="btn-cyber w-full group">
                        Voir plus
                        <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Certifications with View Feature */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4">
              <span className="cyber-text">Certifications</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Certifications professionnelles reconnues dans l'industrie
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <Card key={cert.id} className={`cyber-border hover:matrix-glow transition-all duration-300 fade-in fade-in-delay-${index + 1} group`}>
                <CardContent className="p-6 text-center">
                  <Award className="h-12 w-12 text-secondary mx-auto mb-4" />
                  <h3 className="font-orbitron font-bold text-lg mb-2">{cert.name}</h3>
                  <p className="text-muted-foreground text-sm mb-2">{cert.issuer}</p>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Badge className="text-xs">{new Date(cert.issue_date).getFullYear()}</Badge>
                    {cert.expiry_date && (
                      <Badge variant="outline" className="text-xs">
                        Expire {new Date(cert.expiry_date).getFullYear()}
                      </Badge>
                    )}
                  </div>
                  
                  {/* View Certification Button */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => viewCertification(cert)}
                      className="btn-matrix flex-1 group"
                      disabled={!cert.pdf_url && !cert.image_url && !cert.credential_url}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    {cert.credential_url && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(cert.credential_url, '_blank')}
                        className="btn-ghost-cyber"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4">
              <span className="cyber-text">Contact</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Prêt à discuter de vos besoins en cybersécurité ? Contactez-moi pour une consultation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="cyber-border hover:cyber-glow transition-all duration-300 fade-in fade-in-delay-1">
              <CardContent className="p-6 text-center">
                <Mail className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-muted-foreground text-sm">contact@cybersecpro.com</p>
              </CardContent>
            </Card>

            <Card className="cyber-border hover:cyber-glow transition-all duration-300 fade-in fade-in-delay-2">
              <CardContent className="p-6 text-center">
                <Phone className="h-10 w-10 text-secondary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Téléphone</h3>
                <p className="text-muted-foreground text-sm">+33 1 23 45 67 89</p>
              </CardContent>
            </Card>

            <Card className="cyber-border hover:cyber-glow transition-all duration-300 fade-in fade-in-delay-3">
              <CardContent className="p-6 text-center">
                <MapPin className="h-10 w-10 text-accent mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Localisation</h3>
                <p className="text-muted-foreground text-sm">Paris, France</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center fade-in fade-in-delay-4">
            <Link to="/contact">
              <Button size="lg" className="btn-cyber group">
                <FileText className="mr-2 h-5 w-5" />
                Envoyer un message
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-cyber">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="fade-in">
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4 text-primary-foreground">
              Prêt à Sécuriser Votre Infrastructure ?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Contactez-moi pour discuter de vos besoins en cybersécurité et 
              découvrir comment je peux vous aider à protéger votre entreprise.
            </p>
            <Link to="/contact">
              <Button size="lg" variant="secondary" className="btn-matrix">
                Démarrer un projet
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}