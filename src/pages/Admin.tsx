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
import { AdminLogoManagement } from "@/components/admin/AdminLogoManagement";
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
                <p className="text-sm text-muted-foreground mt-1">
                  Connecté en tant que {currentUser.email}
                </p>
              )}
            </div>
            <Button 
              variant="outline" 
              onClick={async () => {
                await supabase.auth.signOut();
                setIsAuthenticated(false);
                setCurrentUser(null);
              }}
            >
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          {/* Mobile ScrollArea pour les tabs */}
          <div className="w-full overflow-x-auto pb-2">
            <TabsList className="inline-flex h-9 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground min-w-max">
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
              <TabsTrigger value="icons" className="flex items-center gap-1 text-xs px-2 py-1">
                <Image className="w-3 h-3" />
                <span className="hidden xs:inline">Logo</span>
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

          <TabsContent value="dashboard" className="mt-4">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {/* Statistiques */}
              {dashboardStats.map((stat) => (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
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
                <CardTitle className="text-base sm:text-lg">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  <Button onClick={() => setSelectedTab("projects")} variant="outline" size="sm">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Gérer les projets
                  </Button>
                  <Button onClick={() => setSelectedTab("messages")} variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Voir les messages
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

          <TabsContent value="icons">
            <AdminLogoManagement currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Messages de Contact ({contactMessages.filter((m: any) => !m.is_read).length} non lus)
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {contactMessages.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Aucun message pour le moment.
                    </p>
                  ) : (
                    <div className="grid gap-4">
                      {contactMessages.map((message: any) => (
                        <Card key={message.id} className={`transition-all duration-300 hover:shadow-md ${!message.is_read ? 'ring-2 ring-primary/20' : ''}`}>
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
            <SecurityTestPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;