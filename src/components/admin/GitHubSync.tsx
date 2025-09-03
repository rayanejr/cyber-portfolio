import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Download, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function GitHubSync() {
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const { toast } = useToast();

  const handleSync = async () => {
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
      const response = await fetch('https://pcpjqxuuuawwqxrecexm.supabase.co/functions/v1/github-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          token
        })
      });

      const result = await response.json();

      if (response.ok) {
        setSyncResult(result);
        toast({
          title: "Succès",
          description: result.message
        });
      } else {
        throw new Error(result.error || 'Erreur lors de la synchronisation');
      }
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
        <h2 className="text-2xl font-orbitron font-bold">Synchronisation GitHub</h2>
      </div>

      <Card className="cyber-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Importer les projets depuis GitHub
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Cette fonctionnalité récupère automatiquement tous vos repositories GitHub et utilise 
              leurs README pour compléter les détails des projets, en gardant la mise en page actuelle.
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
                Créez un token avec les permissions "repo" sur{" "}
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

          <Button 
            onClick={handleSync} 
            disabled={isLoading}
            className="w-full btn-cyber"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Synchronisation en cours...
              </>
            ) : (
              <>
                <Github className="h-4 w-4 mr-2" />
                Synchroniser les projets
              </>
            )}
          </Button>

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
                    <div className="font-mono text-lg">{syncResult.total_repos}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Nouveaux projets:</span>
                    <div className="font-mono text-lg text-green-400">{syncResult.new_projects}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card className="cyber-border">
        <CardHeader>
          <CardTitle>Fonctionnalités de synchronisation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-400 border-green-400">
                  ✓ README
                </Badge>
                <span className="text-sm">Extraction et conversion automatique du contenu</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-400 border-green-400">
                  ✓ Images
                </Badge>
                <span className="text-sm">Récupération des images depuis les README</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-400 border-green-400">
                  ✓ Technologies
                </Badge>
                <span className="text-sm">Détection automatique via les topics et langages</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-blue-400 border-blue-400">
                  ↻ Mise à jour
                </Badge>
                <span className="text-sm">Mise à jour des projets existants</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-blue-400 border-blue-400">
                  ⭐ Featured
                </Badge>
                <span className="text-sm">Projets mis en avant selon les étoiles</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-blue-400 border-blue-400">
                  🔗 Liens
                </Badge>
                <span className="text-sm">GitHub et demo URLs automatiques</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}