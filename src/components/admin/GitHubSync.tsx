import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Download, RefreshCw, AlertCircle, CheckCircle, Upload, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

export default function GitHubSync() {
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const { toast } = useToast();

  const callGitHubFunction = async (action: string, additionalData: any = {}) => {
    const { data, error } = await supabase.functions.invoke('github-project-manager', {
      body: {
        action,
        username,
        token,
        ...additionalData
      }
    });

    if (error) throw error;
    return data;
  };

  const handleSyncFromGitHub = async () => {
    if (!username || !token) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setSyncResult(null);

    try {
      const result = await callGitHubFunction('sync_from_github');
      setSyncResult(result);
      toast({
        title: "Succès",
        description: result.message
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la synchronisation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushAllToGitHub = async () => {
    if (!username || !token) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Récupérer tous les projets qui n'ont pas d'URL GitHub
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .is('github_url', null)
        .eq('is_active', true);

      if (error) throw error;

      let createdRepos = 0;
      for (const project of projects || []) {
        try {
          await callGitHubFunction('push_to_github', { projectData: project });
          createdRepos++;
        } catch (error) {
          console.error(`Erreur lors de la création du repo pour ${project.title}:`, error);
        }
      }

      toast({
        title: "Succès",
        description: `${createdRepos} repositories créés sur GitHub`
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la synchronisation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncProjectsToGitHub = async () => {
    if (!username || !token) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Récupérer tous les projets qui ont une URL GitHub
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .not('github_url', 'is', null)
        .eq('is_active', true);

      if (error) throw error;

      let updatedRepos = 0;
      for (const project of projects || []) {
        try {
          const repoName = project.github_url?.split('/').pop();
          if (repoName) {
            await callGitHubFunction('update_github_project', { 
              projectData: project, 
              repoName 
            });
            updatedRepos++;
          }
        } catch (error) {
          console.error(`Erreur lors de la mise à jour du repo pour ${project.title}:`, error);
        }
      }

      toast({
        title: "Succès",
        description: `${updatedRepos} repositories mis à jour sur GitHub`
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la synchronisation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Github className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-orbitron font-bold">Synchronisation GitHub Bidirectionnelle</h2>
      </div>

      {/* Configuration */}
      <Card className="cyber-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Configuration GitHub
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Configurez vos identifiants GitHub pour une synchronisation bidirectionnelle complète.
              Vos projets peuvent être synchronisés dans les deux sens.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur GitHub *</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="votre-username"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="token">Token d'accès personnel *</Label>
              <Input
                id="token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Créez un token avec les permissions "repo" et "delete_repo" sur{" "}
                <a 
                  href="https://github.com/settings/tokens" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  GitHub Settings
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions de synchronisation */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* GitHub vers Portfolio */}
        <Card className="cyber-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-500" />
              GitHub → Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Récupérer et mettre à jour les projets depuis vos repositories GitHub.
            </p>
            
            <Button 
              onClick={handleSyncFromGitHub} 
              disabled={isLoading || !username || !token}
              className="w-full"
              variant="outline"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Synchronisation...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Récupérer depuis GitHub
                </>
              )}
            </Button>

            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-400 border-green-400">✓</Badge>
                <span>Extraction automatique des README</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-400 border-green-400">✓</Badge>
                <span>Détection des technologies</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-400 border-green-400">✓</Badge>
                <span>Mise à jour des projets existants</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio vers GitHub */}
        <Card className="cyber-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-green-500" />
              Portfolio → GitHub
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Créer ou mettre à jour vos repositories GitHub depuis votre portfolio.
            </p>
            
            <div className="space-y-2">
              <Button 
                onClick={handlePushAllToGitHub} 
                disabled={isLoading || !username || !token}
                className="w-full"
                variant="outline"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Créer repositories manquants
                  </>
                )}
              </Button>

              <Button 
                onClick={handleSyncProjectsToGitHub} 
                disabled={isLoading || !username || !token}
                className="w-full"
                variant="outline"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Mettre à jour les repositories
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-blue-400 border-blue-400">✓</Badge>
                <span>Création automatique de README</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-blue-400 border-blue-400">✓</Badge>
                <span>Synchronisation des descriptions</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-blue-400 border-blue-400">✓</Badge>
                <span>Mise à jour des URLs de démo</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Résultats */}
      {syncResult && (
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="font-semibold text-green-400">Synchronisation réussie</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Repositories trouvés:</span>
                <div className="font-mono text-lg">{syncResult.total_repos || 0}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Nouveaux projets:</span>
                <div className="font-mono text-lg text-green-400">{syncResult.new_projects || 0}</div>
              </div>
              {syncResult.updated_projects !== undefined && (
                <div>
                  <span className="text-muted-foreground">Projets mis à jour:</span>
                  <div className="font-mono text-lg text-blue-400">{syncResult.updated_projects}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informations importantes */}
      <Card className="cyber-border">
        <CardHeader>
          <CardTitle>⚠️ Informations importantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="font-semibold text-yellow-400 mb-1">Synchronisation bidirectionnelle</p>
              <p className="text-muted-foreground">
                Cette interface permet une synchronisation complète entre votre portfolio et GitHub.
                Les modifications dans un sens seront reflétées dans l'autre.
              </p>
            </div>
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="font-semibold text-red-400 mb-1">Suppression automatique</p>
              <p className="text-muted-foreground">
                Si vous supprimez un projet de votre portfolio qui a une URL GitHub associée, 
                le repository correspondant sera aussi supprimé de GitHub.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}