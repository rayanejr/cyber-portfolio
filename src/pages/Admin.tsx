import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Users, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Wrench, 
  Upload, 
  BarChart, 
  MessageSquare,
  Mail,
  Eye,
  Trash2,
  Lock,
  Shield
} from "lucide-react";
import AdminProjects from "@/components/admin/AdminProjects";
import AdminBlogs from "@/components/admin/AdminBlogs";
import AdminExperiences from "@/components/admin/AdminExperiences";
import AdminFormations from "@/components/admin/AdminFormations";
import AdminCertifications from "@/components/admin/AdminCertifications";
import AdminSkills from "@/components/admin/AdminSkills";
import AdminTools from "@/components/admin/AdminTools";
import AdminFiles from "@/components/admin/AdminFiles";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminAuditLog from "@/components/admin/AdminAuditLog";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    full_name: string;
    is_super_admin: boolean;
  } | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [stats, setStats] = useState({
    projects: 0,
    blogs: 0,
    experiences: 0,
    skills: 0,
    certifications: 0,
    formations: 0,
    tools: 0,
    files: 0,
    messages: 0
  });
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const checkAuth = async () => {
      const sessionToken = localStorage.getItem('admin_session_token');
      if (sessionToken) {
        // Ici vous pourriez vérifier la validité du token côté serveur
        // Pour l'instant, on considère que le token est valide
        try {
          // Récupérer les infos de l'utilisateur connecté
          const { data: userData, error } = await supabase
            .from('admin_users')
            .select('id, full_name, is_super_admin')
            .single();

          if (!error && userData) {
            setCurrentUser(userData);
            setIsAuthenticated(true);
            await fetchStats();
            await fetchContactMessages();
          } else {
            // Token invalide, nettoyer
            localStorage.removeItem('admin_session_token');
          }
        } catch (error) {
          localStorage.removeItem('admin_session_token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    
    try {
      // Utiliser la nouvelle fonction d'authentification sécurisée
      const { data, error } = await supabase.rpc('safe_authenticate_admin', {
        p_email: email,
        p_password: password,
        p_ip: '127.0.0.1' // En production, récupérer la vraie IP
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const userData = data[0];
        setCurrentUser({
          id: userData.admin_id,
          full_name: userData.full_name,
          is_super_admin: userData.is_super_admin
        });
        setIsAuthenticated(true);
        
        // Stocker le token de session
        localStorage.setItem('admin_session_token', userData.session_token);
        
        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${userData.full_name}!`,
        });
      } else {
        setLoginError("Email ou mot de passe incorrect");
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setLoginError(error.message || "Erreur de connexion");
    }
  };

  const fetchStats = async () => {
    try {
      const [
        { count: projectsCount },
        { count: blogsCount },
        { count: experiencesCount },
        { count: skillsCount },
        { count: certificationsCount },
        { count: formationsCount },
        { count: toolsCount },
        { count: filesCount },
        { count: messagesCount }
      ] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('blogs').select('*', { count: 'exact', head: true }),
        supabase.from('experiences').select('*', { count: 'exact', head: true }),
        supabase.from('skills').select('*', { count: 'exact', head: true }),
        supabase.from('certifications').select('*', { count: 'exact', head: true }),
        supabase.from('formations').select('*', { count: 'exact', head: true }),
        supabase.from('tools').select('*', { count: 'exact', head: true }),
        supabase.from('admin_files').select('*', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        projects: projectsCount || 0,
        blogs: blogsCount || 0,
        experiences: experiencesCount || 0,
        skills: skillsCount || 0,
        certifications: certificationsCount || 0,
        formations: formationsCount || 0,
        tools: toolsCount || 0,
        files: filesCount || 0,
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
      console.error('Error fetching contact messages:', error);
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
        prev.map((msg: any) => msg.id === id ? { ...msg, is_read: true } : msg)
      );
      
      toast({
        title: "Message marqué comme lu",
        description: "Le message a été marqué comme lu avec succès.",
      });
    } catch (error: any) {
      console.error('Error marking message as read:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de marquer le message comme lu.",
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
      
      setContactMessages(prev => prev.filter((msg: any) => msg.id !== id));
      
      toast({
        title: "Message supprimé",
        description: "Le message a été supprimé avec succès.",
      });
    } catch (error: any) {
      console.error('Error deleting message:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le message.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full">
          <Card className="cyber-border">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-orbitron">Administration Sécurisée</CardTitle>
              <p className="text-muted-foreground">
                Authentification requise pour accéder au panneau d'administration
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre.email@example.com"
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
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                {loginError && (
                  <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {loginError}
                  </div>
                )}

                <Button type="submit" className="w-full">
                  <Lock className="w-4 h-4 mr-2" />
                  Se connecter
                </Button>
              </form>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  <strong>Note de sécurité :</strong><br />
                  Système d'authentification renforcé avec rate limiting et audit trail.
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
      title: "Projets",
      value: stats.projects,
      icon: Briefcase,
      description: "projets total"
    },
    {
      title: "Articles Blog",
      value: stats.blogs,
      icon: FileText,
      description: "articles publiés"
    },
    {
      title: "Expériences",
      value: stats.experiences,
      icon: Briefcase,
      description: "expériences professionnelles"
    },
    {
      title: "Compétences",
      value: stats.skills,
      icon: Award,
      description: "compétences techniques"
    },
    {
      title: "Certifications",
      value: stats.certifications,
      icon: Award,
      description: "certifications actives"
    },
    {
      title: "Messages",
      value: stats.messages,
      icon: MessageSquare,
      description: `${contactMessages.filter((m: any) => !m.is_read).length} non lus`
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-orbitron text-gradient flex items-center gap-2">
                <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
                Administration
              </h1>
              {currentUser && (
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  Connecté en tant que {currentUser.full_name}
                  {currentUser.is_super_admin && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Super Admin
                    </Badge>
                  )}
                </p>
              )}
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAuthenticated(false);
                setCurrentUser(null);
                localStorage.removeItem('admin_session_token');
              }}
            >
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              {!isMobile && <span>Tableau</span>}
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {!isMobile && <span>Utilisateurs</span>}
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              {!isMobile && <span>Projets</span>}
            </TabsTrigger>
            <TabsTrigger value="blogs" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {!isMobile && <span>Blog</span>}
            </TabsTrigger>
            <TabsTrigger value="experiences" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              {!isMobile && <span>Expériences</span>}
            </TabsTrigger>
            <TabsTrigger value="formations" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              {!isMobile && <span>Formations</span>}
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              {!isMobile && <span>Compétences</span>}
            </TabsTrigger>
            <TabsTrigger value="certifications" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              {!isMobile && <span>Certifications</span>}
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              {!isMobile && <span>Outils</span>}
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              {!isMobile && <span>Fichiers</span>}
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              {!isMobile && <span>Messages</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Statistiques */}
              {dashboardStats.map((stat) => (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Actions rapides */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {currentUser?.is_super_admin && (
                    <Button onClick={() => setSelectedTab("users")} variant="outline">
                      <Users className="w-4 h-4 mr-2" />
                      Gérer les utilisateurs
                    </Button>
                  )}
                  <Button onClick={() => setSelectedTab("projects")} variant="outline">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Gérer les projets
                  </Button>
                  <Button onClick={() => setSelectedTab("blogs")} variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Gérer le blog
                  </Button>
                  <Button onClick={() => setSelectedTab("messages")} variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Voir les messages
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <AdminUsers currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="projects">
            <AdminProjects />
          </TabsContent>

          <TabsContent value="blogs">
            <AdminBlogs />
          </TabsContent>

          <TabsContent value="experiences">
            <AdminExperiences />
          </TabsContent>

          <TabsContent value="formations">
            <AdminFormations />
          </TabsContent>

          <TabsContent value="skills">
            <AdminSkills />
          </TabsContent>

          <TabsContent value="certifications">
            <AdminCertifications />
          </TabsContent>

          <TabsContent value="tools">
            <AdminTools />
          </TabsContent>

          <TabsContent value="files">
            <AdminFiles />
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
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
                    contactMessages.map((message: any) => (
                      <Card key={message.id} className={`transition-all duration-300 ${!message.is_read ? 'border-primary/50 bg-primary/5' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold">{message.name}</span>
                                <span className="text-sm text-muted-foreground">({message.email})</span>
                                {!message.is_read && (
                                  <Badge variant="secondary" className="text-xs">Nouveau</Badge>
                                )}
                              </div>
                              {message.subject && (
                                <p className="text-sm font-medium mb-2">{message.subject}</p>
                              )}
                              <p className="text-sm text-muted-foreground mb-3">{message.message}</p>
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
                                  <Eye className="w-4 h-4" />
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => window.open(`mailto:${message.email}`)}
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => deleteMessage(message.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;