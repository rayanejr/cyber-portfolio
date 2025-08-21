import { ArrowRight, Shield, Target, Code, Award, ExternalLink, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import heroImage from "@/assets/cyber-hero.jpg";

export default function Home() {
  const skills = [
    { category: "Sécurité Offensive", items: ["Pentest", "Bug Bounty", "Red Team", "Social Engineering"] },
    { category: "Sécurité Défensive", items: ["SOC", "SIEM", "Incident Response", "Forensics"] },
    { category: "Outils & Technologies", items: ["Kali Linux", "Metasploit", "Burp Suite", "Wireshark"] },
    { category: "Certifications", items: ["CISSP", "CEH", "OSCP", "Security+"] }
  ];

  const recentProjects = [
    {
      id: 1,
      title: "Pentest Infrastructure Bancaire",
      description: "Audit de sécurité complet d'une infrastructure bancaire avec identification de vulnérabilités critiques.",
      tech: ["Python", "Nmap", "Metasploit"],
      date: "2024"
    },
    {
      id: 2,
      title: "SOC Implementation",
      description: "Mise en place d'un Security Operations Center avec détection d'incidents en temps réel.",
      tech: ["Splunk", "ELK Stack", "MITRE ATT&CK"],
      date: "2024"
    },
    {
      id: 3,
      title: "Threat Hunting Platform",
      description: "Développement d'une plateforme de chasse aux menaces avec IA pour la détection proactive.",
      tech: ["Python", "Machine Learning", "Elasticsearch"],
      date: "2023"
    }
  ];

  const certifications = [
    { name: "CISSP", issuer: "ISC2", year: "2024" },
    { name: "CEH", issuer: "EC-Council", year: "2023" },
    { name: "OSCP", issuer: "Offensive Security", year: "2023" },
    { name: "Security+", issuer: "CompTIA", year: "2022" }
  ];

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
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Passionné par la cybersécurité depuis plus de 8 ans, j'aide les entreprises 
              à sécuriser leurs infrastructures et à se protéger contre les cybermenaces.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="cyber-border hover:cyber-glow transition-all duration-300 fade-in fade-in-delay-1">
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Sécurité Défensive</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Mise en place de SOC, SIEM et stratégies de détection d'incidents.
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
                  Pentests, audits de sécurité et évaluations de vulnérabilités.
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
                  Création d'outils de sécurité et intégration de bonnes pratiques.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4">
              Compétences
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {skills.map((skillGroup, index) => (
              <Card key={skillGroup.category} className={`cyber-border hover:cyber-glow transition-all duration-300 fade-in fade-in-delay-${index + 1}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{skillGroup.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {skillGroup.items.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Projects */}
      <section className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-16 fade-in">
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold">
              Projets Récents
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
              <Card key={project.id} className={`cyber-border hover:cyber-glow transition-all duration-300 fade-in fade-in-delay-${index + 1}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <Badge variant="outline">{project.date}</Badge>
                  </div>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  <Link to={`/projects/${project.id}`}>
                    <Button variant="ghost" size="sm" className="btn-ghost-cyber">
                      Voir plus
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4">
              Certifications
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <Card key={cert.name} className={`cyber-border hover:matrix-glow transition-all duration-300 fade-in fade-in-delay-${index + 1}`}>
                <CardContent className="p-6 text-center">
                  <Award className="h-8 w-8 text-secondary mx-auto mb-3" />
                  <h3 className="font-orbitron font-bold text-lg mb-1">{cert.name}</h3>
                  <p className="text-muted-foreground text-sm">{cert.issuer}</p>
                  <Badge className="mt-2">{cert.year}</Badge>
                </CardContent>
              </Card>
            ))}
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
              découvrir comment je peux vous aider.
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