import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { 
  Users, 
  Shield, 
  AlertTriangle, 
  TrendingUp,
  FileText,
  Settings,
  Database,
  Activity,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Lock
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [stats, setStats] = useState({
    projects: 0,
    visitors: 0,
    alerts: 0,
    articles: 0,
    formations: 0,
    experiences: 0,
    tools: 0,
    messages: 0
  });
  const [contactMessages, setContactMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchContactMessages();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email === "admin@cybersecpro.com" && password === "CyberAdmin2024!") {
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Identifiants incorrects. Utilisez admin@cybersecpro.com / CyberAdmin2024!");
    }
  };

  const fetchStats = async () => {
    try {
      const [
        { count: formationsCount },
        { count: experiencesCount },
        { count: toolsCount },
        { count: messagesCount }
      ] = await Promise.all([
        supabase.from('formations').select('*', { count: 'exact', head: true }),
        supabase.from('experiences').select('*', { count: 'exact', head: true }),
        supabase.from('tools').select('*', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        projects: 0,
        visitors: 1234,
        alerts: 3,
        articles: 24,
        formations: formationsCount || 0,
        experiences: experiencesCount || 0,
        tools: toolsCount || 0,
        messages: messagesCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchContactMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContactMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessageAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      
      setContactMessages(prev => 
        prev.map(msg => msg.id === id ? { ...msg, is_read: true } : msg)
      );
      
      toast({
        title: "Message marqué comme lu",
        description: "Le message a été marqué comme lu avec succès.",
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      toast({
        title: "Erreur",
        description: "Impossible de marquer le message comme lu.",
        variant: "destructive",
      });
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setContactMessages(prev => prev.filter(msg => msg.id !== id));
      
      toast({
        title: "Message supprimé",
        description: "Le message a été supprimé avec succès.",
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le message.",
        variant: "destructive",
      });
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
              <p className="text-muted-foreground">
                Connectez-vous pour accéder au panneau d'administration
              </p>
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

                {loginError && (
                  <Alert className="border-destructive/50 text-destructive">
                    <AlertDescription>{loginError}</AlertDescription>
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

  const dashboardStats = [
    {
      title: "Formations",
      value: stats.formations,
      icon: <Database className="w-4 h-4" />,
      trend: `${stats.formations} total`
    },
    {
      title: "Expériences",
      value: stats.experiences,
      icon: <Users className="w-4 h-4" />,
      trend: `${stats.experiences} total`
    },
    {
      title: "Outils",
      value: stats.tools,
      icon: <Shield className="w-4 h-4" />,
      trend: `${stats.tools} disponibles`
    },
    {
      title: "Messages",
      value: stats.messages,
      icon: <FileText className="w-4 h-4" />,
      trend: `${contactMessages.filter(m => !m.is_read).length} non lus`
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard Admin</h1>
              <p className="text-muted-foreground">
                Gestion complète du portfolio cybersécurité
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                <Shield className="w-3 h-3 mr-1" />
                Sécurisé
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
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="formations">Formations</TabsTrigger>
            <TabsTrigger value="experiences">Expériences</TabsTrigger>
            <TabsTrigger value="tools">Outils</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardStats.map((stat, index) => (
                <Card key={index} className="hover:shadow-cyber transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <div className="text-primary">
                      {stat.icon}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.trend}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-cyber transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Gestion des Contenus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Gérez toutes les données du portfolio depuis un seul endroit.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setSelectedTab("formations")}>
                      Formations
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setSelectedTab("experiences")}>
                      Expériences
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-cyber transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Messages de Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {contactMessages.filter(m => !m.is_read).length} nouveaux messages en attente.
                  </p>
                  <Button size="sm" onClick={() => setSelectedTab("messages")}>
                    Voir les messages
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-cyber transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Outils Cybersécurité
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Gérez les outils gratuits disponibles sur le site.
                  </p>
                  <Button size="sm" onClick={() => setSelectedTab("tools")}>
                    Gérer les outils
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Messages de Contact ({contactMessages.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contactMessages.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Aucun message pour le moment.
                    </p>
                  ) : (
                    contactMessages.map((message) => (
                      <Card key={message.id} className={`transition-all duration-300 ${!message.is_read ? 'border-primary/50 bg-primary/5' : ''}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{message.name}</span>
                                <span className="text-sm text-muted-foreground">({message.email})</span>
                                {!message.is_read && (
                                  <Badge variant="secondary" className="text-xs">Nouveau</Badge>
                                )}
                              </div>
                              {message.subject && (
                                <p className="text-sm font-medium">{message.subject}</p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {new Date(message.created_at).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {!message.is_read && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => markMessageAsRead(message.id)}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => deleteMessage(message.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="formations">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Formations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Interface de gestion des formations en développement...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experiences">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Expériences</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Interface de gestion des expériences en développement...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Outils</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Interface de gestion des outils en développement...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres du Site</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Interface de paramétrage en développement...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;