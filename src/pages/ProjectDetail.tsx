import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Github, ExternalLink, Calendar, Tag, Users, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ProjectDetail() {
  const { id } = useParams();

  // Mock data - In real app, this would come from API/database
  const project = {
    id: 1,
    title: "Pentest Infrastructure Bancaire",
    description: "Audit de sécurité complet d'une infrastructure bancaire avec identification de vulnérabilités critiques et recommandations de remédiation.",
    fullDescription: `Ce projet consistait en un audit de sécurité approfondi d'une infrastructure bancaire critique. L'objectif était d'identifier les vulnérabilités potentielles et de fournir des recommandations détaillées pour améliorer la posture de sécurité.

L'audit a été réalisé selon une méthodologie rigoureuse incluant :
- Reconnaissance passive et active
- Cartographie du réseau et des services
- Tests d'intrusion sur les applications web
- Évaluation des configurations système
- Tests de phishing et d'ingénierie sociale
- Analyse des politiques de sécurité

Les résultats ont permis d'identifier 23 vulnérabilités, dont 5 critiques, et de proposer un plan de remédiation priorisé.`,
    category: "Pentest",
    technologies: ["Python", "Nmap", "Metasploit", "Burp Suite", "Kali Linux", "OpenVAS"],
    year: "2024",
    duration: "3 mois",
    team: "4 personnes",
    client: "Banque Européenne (Confidentiel)",
    status: "Terminé",
    image: "/placeholder.svg",
    github: "https://github.com/cybersecpro/bank-pentest",
    demo: null,
    challenges: [
      "Infrastructure complexe avec multiples zones de sécurité",
      "Environnement de production sensible nécessitant des tests non-intrusifs",
      "Conformité aux réglementations bancaires strictes",
      "Coordination avec les équipes IT internes"
    ],
    solutions: [
      "Méthodologie de test adaptée aux contraintes de production",
      "Utilisation d'outils de scanning passifs et de reconnaissance OSINT",
      "Tests en environnement de pré-production quand possible",
      "Communication continue avec les équipes techniques"
    ],
    results: [
      "23 vulnérabilités identifiées (5 critiques, 8 élevées, 10 moyennes)",
      "Plan de remédiation priorisé sur 6 mois",
      "Formation des équipes internes aux bonnes pratiques",
      "Amélioration de 40% du score de sécurité global"
    ],
    technologies_detail: {
      "Python": "Scripts d'automatisation et d'exploitation",
      "Nmap": "Cartographie réseau et découverte de services",
      "Metasploit": "Framework d'exploitation des vulnérabilités",
      "Burp Suite": "Test d'intrusion des applications web",
      "Kali Linux": "Distribution spécialisée en tests de pénétration",
      "OpenVAS": "Scanner de vulnérabilités open source"
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Projet non trouvé</h1>
          <Link to="/projects">
            <Button variant="outline" className="btn-ghost-cyber">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux projets
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Terminé": return "default";
      case "En cours": return "secondary";
      case "Maintenance": return "outline";
      default: return "default";
    }
  };

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 fade-in">
          <Link to="/projects">
            <Button variant="ghost" className="mb-4 btn-ghost-cyber">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux projets
            </Button>
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <Badge variant={getStatusBadgeVariant(project.status)}>
                  {project.status}
                </Badge>
                <Badge variant="outline">{project.year}</Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-orbitron font-bold mb-4">
                {project.title}
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-3xl">
                {project.description}
              </p>
            </div>
            
            <div className="flex gap-4">
              {project.github && (
                <Button 
                  onClick={() => window.open(project.github, '_blank')}
                  className="btn-cyber"
                >
                  <Github className="mr-2 h-4 w-4" />
                  Voir le code
                </Button>
              )}
              {project.demo && (
                <Button 
                  variant="outline"
                  onClick={() => window.open(project.demo, '_blank')}
                  className="btn-ghost-cyber"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Démo live
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Image */}
            <div className="fade-in fade-in-delay-1">
              <img 
                src={project.image} 
                alt={project.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg cyber-border"
              />
            </div>

            {/* Description */}
            <Card className="cyber-border fade-in fade-in-delay-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-primary" />
                  Description du Projet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  {project.fullDescription.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-muted-foreground mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Challenges */}
            <Card className="cyber-border fade-in fade-in-delay-3">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
                  Défis Rencontrés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {project.challenges.map((challenge, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-muted-foreground">{challenge}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Solutions */}
            <Card className="cyber-border fade-in fade-in-delay-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-secondary" />
                  Solutions Mises en Place
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {project.solutions.map((solution, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-secondary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-muted-foreground">{solution}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="cyber-border fade-in fade-in-delay-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="mr-2 h-5 w-5 text-primary" />
                  Résultats Obtenus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {project.results.map((result, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-muted-foreground">{result}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <Card className="cyber-border fade-in fade-in-delay-1">
              <CardHeader>
                <CardTitle>Informations du Projet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-3 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Durée</div>
                    <div className="text-sm text-muted-foreground">{project.duration}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-3 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Équipe</div>
                    <div className="text-sm text-muted-foreground">{project.team}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-3 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Catégorie</div>
                    <div className="text-sm text-muted-foreground">{project.category}</div>
                  </div>
                </div>

                <div>
                  <div className="font-medium mb-2">Client</div>
                  <div className="text-sm text-muted-foreground">{project.client}</div>
                </div>
              </CardContent>
            </Card>

            {/* Technologies */}
            <Card className="cyber-border fade-in fade-in-delay-2">
              <CardHeader>
                <CardTitle>Technologies Utilisées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(project.technologies_detail).map(([tech, description]) => (
                    <div key={tech}>
                      <Badge variant="secondary" className="mb-2">
                        {tech}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="cyber-border bg-gradient-cyber fade-in fade-in-delay-3">
              <CardContent className="p-6 text-center">
                <h3 className="font-orbitron font-bold text-lg mb-2 text-primary-foreground">
                  Projet Similaire ?
                </h3>
                <p className="text-primary-foreground/80 text-sm mb-4">
                  Discutons de vos besoins en cybersécurité.
                </p>
                <Link to="/contact">
                  <Button variant="secondary" size="sm" className="btn-matrix w-full">
                    Me contacter
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}