import { useState } from "react";
import { Shield, Users, FileText, Settings, BarChart3, Calendar, Bell, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock authentication - in real app, this would connect to Supabase
    if (email === "admin@cybersecpro.com" && password === "CyberAdmin2024!") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Identifiants incorrects. Utilisez admin@cybersecpro.com / CyberAdmin2024!");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="max-w-md w-full mx-auto px-4">
          <Card className="cyber-border">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-orbitron">Interface Admin</CardTitle>
              <CardDescription>
                Connectez-vous pour accéder au panneau d'administration
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@cybersecpro.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="CyberAdmin2024!"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                {error && (
                  <Alert className="border-destructive/50 text-destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full btn-cyber">
                  Se connecter
                </Button>
              </form>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  <strong>Identifiants de démonstration :</strong><br />
                  Email: admin@cybersecpro.com<br />
                  Mot de passe: CyberAdmin2024!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const stats = [
    { title: "Projets Actifs", value: "12", change: "+2", icon: BarChart3, color: "text-primary" },
    { title: "Articles Publiés", value: "28", change: "+5", icon: FileText, color: "text-secondary" },
    { title: "Visiteurs (30j)", value: "2,847", change: "+12%", icon: Users, color: "text-accent" },
    { title: "Messages", value: "15", change: "+3", icon: Bell, color: "text-yellow-500" },
  ];

  const recentProjects = [
    { id: 1, title: "Pentest Infrastructure Bancaire", status: "Terminé", priority: "Haute" },
    { id: 2, title: "SOC Implementation", status: "En cours", priority: "Critique" },
    { id: 3, title: "Threat Hunting Platform", status: "Terminé", priority: "Moyenne" },
  ];

  const recentMessages = [
    { id: 1, name: "Jean Dupont", email: "jean@example.com", subject: "Demande de pentest", date: "2024-03-15" },
    { id: 2, name: "Marie Martin", email: "marie@corp.com", subject: "Formation équipe", date: "2024-03-14" },
    { id: 3, name: "Pierre Durand", email: "pierre@startup.io", subject: "Consultation RGPD", date: "2024-03-13" },
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 fade-in">
          <div>
            <h1 className="text-3xl font-orbitron font-bold mb-2">
              Tableau de Bord <span className="cyber-text">Admin</span>
            </h1>
            <p className="text-muted-foreground">
              Gérez votre portfolio et votre contenu depuis cette interface
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Badge variant="outline" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Admin connecté
            </Badge>
            <Button 
              variant="outline" 
              onClick={() => setIsAuthenticated(false)}
              className="btn-ghost-cyber"
            >
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={stat.title} className={`cyber-border hover:cyber-glow transition-all duration-300 fade-in fade-in-delay-${index + 1}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-secondary">{stat.change}</span> ce mois
                    </p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <div className="fade-in fade-in-delay-2">
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
              <TabsTrigger value="dashboard">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="projects">Projets</TabsTrigger>
              <TabsTrigger value="blog">Blog</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>

            {/* Dashboard Overview */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Projects */}
                <Card className="cyber-border">
                  <CardHeader>
                    <CardTitle>Projets Récents</CardTitle>
                    <CardDescription>Vos derniers projets et leur statut</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentProjects.map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div>
                            <p className="font-medium">{project.title}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={project.status === "Terminé" ? "default" : "secondary"}>
                                {project.status}
                              </Badge>
                              <Badge variant="outline">{project.priority}</Badge>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="btn-ghost-cyber">
                            Voir
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Messages */}
                <Card className="cyber-border">
                  <CardHeader>
                    <CardTitle>Messages Récents</CardTitle>
                    <CardDescription>Dernières demandes de contact</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentMessages.map((message) => (
                        <div key={message.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div>
                            <p className="font-medium">{message.name}</p>
                            <p className="text-sm text-muted-foreground">{message.subject}</p>
                            <p className="text-xs text-muted-foreground">{message.date}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="btn-ghost-cyber">
                            Répondre
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Projects Management */}
            <TabsContent value="projects">
              <Card className="cyber-border">
                <CardHeader>
                  <CardTitle>Gestion des Projets</CardTitle>
                  <CardDescription>Créez, modifiez et gérez vos projets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Gestion des Projets</h3>
                    <p className="text-muted-foreground mb-4">
                      Cette fonctionnalité nécessite la connexion à Supabase pour la gestion de la base de données.
                    </p>
                    <Button className="btn-cyber">Configurer Supabase</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Blog Management */}
            <TabsContent value="blog">
              <Card className="cyber-border">
                <CardHeader>
                  <CardTitle>Gestion du Blog</CardTitle>
                  <CardDescription>Rédigez et publiez vos articles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Éditeur d'Articles</h3>
                    <p className="text-muted-foreground mb-4">
                      Créez et gérez vos articles de blog avec un éditeur riche.
                    </p>
                    <Button className="btn-cyber">Nouvel Article</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Messages */}
            <TabsContent value="messages">
              <Card className="cyber-border">
                <CardHeader>
                  <CardTitle>Centre de Messages</CardTitle>
                  <CardDescription>Gérez vos communications clients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Bell className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Messagerie</h3>
                    <p className="text-muted-foreground mb-4">
                      Système de messagerie intégré pour gérer les demandes clients.
                    </p>
                    <Button className="btn-cyber">Voir tous les messages</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics">
              <Card className="cyber-border">
                <CardHeader>
                  <CardTitle>Analytics & Statistiques</CardTitle>
                  <CardDescription>Suivez les performances de votre portfolio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Tableaux de Bord</h3>
                    <p className="text-muted-foreground mb-4">
                      Visualisez vos métriques de trafic, engagement et conversions.
                    </p>
                    <Button className="btn-cyber">Voir les stats</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings">
              <Card className="cyber-border">
                <CardHeader>
                  <CardTitle>Paramètres</CardTitle>
                  <CardDescription>Configurez votre portfolio et vos préférences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Settings className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Configuration</h3>
                    <p className="text-muted-foreground mb-4">
                      Personnalisez l'apparence et le comportement de votre portfolio.
                    </p>
                    <Button className="btn-cyber">Paramètres avancés</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Notice */}
        <div className="mt-12 fade-in fade-in-delay-3">
          <Alert className="cyber-border">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Note :</strong> Cette interface de démonstration montre la structure de l'administration. 
              Pour une fonctionnalité complète avec base de données, authentification sécurisée et gestion de contenu, 
              connectez votre projet à Supabase via le bouton vert en haut à droite.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}