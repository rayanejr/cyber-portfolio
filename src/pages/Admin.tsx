import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { 
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
  Github,
  Image,
  Database
} from "lucide-react";
import AdminProjects from "@/components/admin/AdminProjects";

import AdminVeille from "@/components/admin/AdminVeille";
import AdminExperiences from "@/components/admin/AdminExperiences";
import AdminFormations from "@/components/admin/AdminFormations";
import AdminCertifications from "@/components/admin/AdminCertifications";
import AdminSkills from "@/components/admin/AdminSkills";
import AdminTools from "@/components/admin/AdminTools";
import AdminFiles from "@/components/admin/AdminFiles";

import GitHubSync from "@/components/admin/GitHubSync";
import AdminSecurity from "@/components/admin/AdminSecurity";
import { SecurityTestPanel } from "@/components/admin/SecurityTestPanel";
import { AdminSecurityAdvanced } from "@/components/admin/AdminSecurityAdvanced";
import { AdminUsersManagement } from "@/components/admin/AdminUsersManagement";

import AdminAuth from "@/components/auth/AdminAuth";

import type { User } from '@supabase/supabase-js';

const Admin = () => {
  useDocumentTitle("Administration");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    projects: 0,
    veille: 0,
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
    // Vérifier l'authentification via Supabase Auth uniquement
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
        setIsAuthenticated(true);
        await fetchStats();
        await fetchContactMessages();
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleAuthenticated = async (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    await fetchStats();
    await fetchContactMessages();
    
    toast({
      title: "Connexion réussie",
      description: `Bienvenue dans l'administration!`,
    });
  };

  const fetchStats = async () => {
    try {
      const [
        { count: projectsCount },
        
        { count: veilleCount },
        { count: experiencesCount },
        { count: skillsCount },
        { count: certificationsCount },
        { count: formationsCount },
        { count: toolsCount },
        { count: filesCount },
        { count: messagesCount }
      ] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        
        supabase.from('veille_techno').select('*', { count: 'exact', head: true }),
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
        
        veille: veilleCount || 0,
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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-center mb-8">Administration</h1>
            <AdminAuth onAuthenticated={handleAuthenticated} />
          </div>
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
      title: "Veille Techno",
      value: stats.veille,
      icon: Database,
      description: "éléments de veille"
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 cyber-grid opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
      
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-xl relative z-10 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-orbitron flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 pulse-glow">
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Administration
                </span>
              </h1>
              {currentUser && (
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2 ml-14">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Connecté en tant que <span className="font-medium text-foreground">{currentUser.email}</span>
                </p>
              )}
            </div>
            <Button 
              variant="outline" 
              className="cyber-border hover:cyber-glow group"
              onClick={async () => {
                await supabase.auth.signOut();
                setIsAuthenticated(false);
                setCurrentUser(null);
              }}
            >
              <Lock className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 relative z-10">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          {/* Mobile ScrollArea pour les tabs */}
          <div className="w-full overflow-x-auto pb-2 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            <TabsList className="inline-flex h-9 items-center justify-start rounded-lg bg-muted/50 backdrop-blur-sm p-1 text-muted-foreground min-w-max cyber-border">
              <TabsTrigger value="dashboard" className="flex items-center gap-1 text-xs px-2 py-1">
                <BarChart className="w-3 h-3" />
                <span className="hidden xs:inline">Tableau</span>
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-1 text-xs px-2 py-1">
                <Briefcase className="w-3 h-3" />
                <span className="hidden xs:inline">Projets</span>
              </TabsTrigger>
              <TabsTrigger value="veille" className="flex items-center gap-1 text-xs px-2 py-1">
                <Database className="w-3 h-3" />
                <span className="hidden xs:inline">Veille</span>
              </TabsTrigger>
              <TabsTrigger value="experiences" className="flex items-center gap-1 text-xs px-2 py-1">
                <Briefcase className="w-3 h-3" />
                <span className="hidden sm:inline">Exp.</span>
              </TabsTrigger>
              <TabsTrigger value="formations" className="flex items-center gap-1 text-xs px-2 py-1">
                <GraduationCap className="w-3 h-3" />
                <span className="hidden sm:inline">Form.</span>
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex items-center gap-1 text-xs px-2 py-1">
                <Award className="w-3 h-3" />
                <span className="hidden sm:inline">Compét.</span>
              </TabsTrigger>
              <TabsTrigger value="certifications" className="flex items-center gap-1 text-xs px-2 py-1">
                <Award className="w-3 h-3" />
                <span className="hidden sm:inline">Certif.</span>
              </TabsTrigger>
              <TabsTrigger value="tools" className="flex items-center gap-1 text-xs px-2 py-1">
                <Wrench className="w-3 h-3" />
                <span className="hidden xs:inline">Outils</span>
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-1 text-xs px-2 py-1">
                <Upload className="w-3 h-3" />
                <span className="hidden xs:inline">Fichiers</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-1 text-xs px-2 py-1">
                <MessageSquare className="w-3 h-3" />
                <span className="hidden xs:inline">Messages</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-1 text-xs px-2 py-1">
                <Lock className="w-3 h-3" />
                <span className="hidden xs:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1 text-xs px-2 py-1">
                <Lock className="w-3 h-3" />
                <span className="hidden xs:inline">Sécurité</span>
              </TabsTrigger>
              <TabsTrigger value="security-tests" className="flex items-center gap-1 text-xs px-2 py-1">
                <FileText className="w-3 h-3" />
                <span className="hidden xs:inline">Tests</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="mt-4 space-y-6">
            {/* Statistiques */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {dashboardStats.map((stat, idx) => (
                <Card 
                  key={stat.title} 
                  className="relative overflow-hidden cyber-border bg-card/30 backdrop-blur-xl hover:scale-[1.02] transition-all duration-500 group/card animate-fade-in border-primary/20"
                  style={{ animationDelay: `${0.5 + (idx * 0.1)}s`, animationFillMode: 'both' }}
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Glow effect */}
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-lg opacity-0 group-hover/card:opacity-100 blur-sm transition-opacity duration-500 -z-10"></div>
                  
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
                    <CardTitle className="text-sm font-medium text-foreground/80 group-hover/card:text-primary transition-colors duration-300">
                      {stat.title}
                    </CardTitle>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 group-hover/card:from-primary/20 group-hover/card:to-secondary/20 transition-all duration-300 group-hover/card:scale-110 group-hover/card:rotate-3">
                      <stat.icon className="h-5 w-5 text-primary group-hover/card:text-secondary transition-colors duration-300" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent group-hover/card:scale-105 transition-transform duration-300 font-orbitron">
                      {stat.value}
                    </div>
                    <p className="text-xs text-muted-foreground group-hover/card:text-foreground/70 transition-colors duration-300 mt-1">
                      {stat.description}
                    </p>
                  </CardContent>
                  
                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                </Card>
              ))}
            </div>

            {/* Actions rapides */}
            <Card className="relative overflow-hidden cyber-border bg-card/30 backdrop-blur-xl animate-fade-in border-primary/20" style={{ animationDelay: '1.2s', animationFillMode: 'both' }}>
              {/* Background effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
              
              <CardHeader className="relative">
                <CardTitle className="text-lg flex items-center gap-3 font-orbitron">
                  <div className="w-1 h-8 bg-gradient-to-b from-primary via-secondary to-accent rounded-full"></div>
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Actions Rapides
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  <Button 
                    onClick={() => setSelectedTab("projects")} 
                    variant="outline" 
                    className="cyber-border hover:cyber-glow group relative overflow-hidden h-12"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Briefcase className="w-4 h-4 mr-2 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
                    <span className="relative">Gérer les projets</span>
                  </Button>
                  <Button 
                    onClick={() => setSelectedTab("messages")} 
                    variant="outline" 
                    className="cyber-border hover:cyber-glow group relative overflow-hidden h-12"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <MessageSquare className="w-4 h-4 mr-2 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
                    <span className="relative">Voir les messages</span>
                  </Button>
                  <Button 
                    onClick={() => setSelectedTab("security")} 
                    variant="outline" 
                    className="cyber-border hover:cyber-glow group relative overflow-hidden h-12"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Lock className="w-4 h-4 mr-2 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
                    <span className="relative">Sécurité</span>
                  </Button>
                  <Button 
                    onClick={() => setSelectedTab("users")} 
                    variant="outline" 
                    className="cyber-border hover:cyber-glow group relative overflow-hidden h-12"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Database className="w-4 h-4 mr-2 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
                    <span className="relative">Utilisateurs</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <AdminProjects />
          </TabsContent>

          <TabsContent value="veille">
            <AdminVeille />
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
            <Card className="cyber-border bg-card/30 backdrop-blur-xl border-primary/20 relative overflow-hidden">
              {/* Background effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
              
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 font-orbitron">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Messages de Contact
                  </span>
                  <Badge variant="secondary" className="ml-auto">
                    {contactMessages.filter((m: any) => !m.is_read).length} non lus
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative">
                <div className="space-y-4">
                  {contactMessages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">
                        Aucun message pour le moment.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {contactMessages.map((message: any, idx: number) => (
                        <Card 
                          key={message.id} 
                          className={`relative overflow-hidden transition-all duration-300 hover:scale-[1.01] animate-fade-in ${
                            !message.is_read 
                              ? 'cyber-border bg-card/50 backdrop-blur-sm border-primary/30' 
                              : 'bg-card/30 backdrop-blur-sm border-muted/30'
                          }`}
                          style={{ animationDelay: `${idx * 0.1}s`, animationFillMode: 'both' }}
                        >
                          {/* Glow for unread messages */}
                          {!message.is_read && (
                            <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-lg opacity-50 blur-sm -z-10"></div>
                          )}
                          
                          <CardContent className="p-5">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${!message.is_read ? 'bg-primary animate-pulse' : 'bg-muted'}`}></div>
                                    <span className="font-semibold text-foreground">{message.name}</span>
                                  </div>
                                  <span className="text-sm text-muted-foreground">({message.email})</span>
                                  {!message.is_read && (
                                    <Badge variant="default" className="text-xs bg-primary/20 text-primary border-primary/30">
                                      Nouveau
                                    </Badge>
                                  )}
                                </div>
                                
                                {message.subject && (
                                  <p className="text-sm font-medium text-foreground/90 border-l-2 border-primary/30 pl-3">
                                    {message.subject}
                                  </p>
                                )}
                                
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {message.message}
                                </p>
                                
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <div className="w-1 h-1 rounded-full bg-primary"></div>
                                  {new Date(message.created_at).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                              
                              <div className="flex gap-2 sm:flex-col">
                                {!message.is_read && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => markMessageAsRead(message.id)}
                                    className="cyber-border hover:cyber-glow group"
                                  >
                                    <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => window.open(`mailto:${message.email}`)}
                                  className="cyber-border hover:cyber-glow group"
                                >
                                  <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => deleteMessage(message.id)}
                                  className="group"
                                >
                                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <AdminUsersManagement currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="security">
            <AdminSecurityAdvanced currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="security-tests">
            <SecurityTestPanel currentUser={currentUser} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;