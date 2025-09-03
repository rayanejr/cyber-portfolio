import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  Key, 
  Activity, 
  Lock, 
  RefreshCw,
  Mail,
  Globe,
  Database
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SecurityDashboard from "../SecurityDashboard";

interface AdminSecurityProps {
  currentUser: {
    id: string;
    full_name: string;
  } | null;
}

const AdminSecurity = ({ currentUser }: AdminSecurityProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fonction pour rotation manuelle des sessions
  const rotateSessionsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('rotate_expired_sessions');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Rotation des sessions",
        description: `${data} sessions expirées ont été désactivées`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de faire la rotation des sessions",
        variant: "destructive",
      });
    }
  });

  // Fonction pour nettoyer les anciennes données
  const cleanupDataMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('cleanup_old_security_data');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Nettoyage terminé",
        description: data,
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de nettoyer les données",
        variant: "destructive",
      });
    }
  });

  // Fonction pour tester les alertes email
  const testEmailAlertMutation = useMutation({
    mutationFn: async () => {
      // Créer un log de test pour déclencher une alerte
      const { error } = await supabase.rpc('log_security_event', {
        p_event_type: 'SECURITY_TEST',
        p_severity: 'MEDIUM',
        p_source: 'ADMIN_PANEL',
        p_user_id: currentUser?.id,
        p_metadata: { test: true, source: 'manual_test' }
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Test d'alerte envoyé",
        description: "Une alerte de test a été générée",
      });
    }
  });

  // Récupérer les sessions actives
  const { data: activeSessions } = useQuery({
    queryKey: ['admin-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('is_active', true)
        .order('last_activity', { ascending: false });
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Actualiser toutes les 30 secondes
  });

  const { data: securityMetrics } = useQuery({
    queryKey: ['security-metrics'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const [logsResult, anomaliesResult, rateLimit] = await Promise.all([
        supabase
          .from('security_logs')
          .select('*', { count: 'exact' })
          .gte('created_at', last24h),
        supabase
          .from('anomaly_detections')
          .select('*', { count: 'exact' })
          .eq('is_resolved', false),
        supabase
          .from('rate_limit_tracking')
          .select('*', { count: 'exact' })
          .eq('is_blocked', true)
          .gte('created_at', last24h)
      ]);

      return {
        logsLast24h: logsResult.count || 0,
        activeAnomalies: anomaliesResult.count || 0,
        blockedIPs: rateLimit.count || 0
      };
    },
    refetchInterval: 10000, // Actualiser toutes les 10 secondes
  });

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Vous devez être connecté pour accéder à cette section.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sécurité Avancée</h2>
          <p className="text-muted-foreground">
            Surveillance, alertes et protection en temps réel
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => rotateSessionsMutation.mutate()}
            disabled={rotateSessionsMutation.isPending}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Rotation Sessions
          </Button>
          <Button
            variant="outline"
            onClick={() => cleanupDataMutation.mutate()}
            disabled={cleanupDataMutation.isPending}
          >
            <Database className="w-4 h-4 mr-2" />
            Nettoyer Données
          </Button>
        </div>
      </div>

      {/* Métriques de sécurité */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Événements 24h</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics?.logsLast24h || 0}</div>
            <p className="text-xs text-muted-foreground">
              Logs de sécurité générés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anomalies Actives</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {securityMetrics?.activeAnomalies || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Nécessitent une attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IPs Bloquées</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {securityMetrics?.blockedIPs || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Rate limiting actif
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="protection">Protection</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="w-full">
            <SecurityDashboard />
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gestion des Sessions
              </CardTitle>
              <CardDescription>
                Sessions administrateur actives avec rotation automatique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSessions?.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Session Administrative</p>
                      <p className="text-sm text-muted-foreground">
                        IP: {session.ip_address || 'N/A'} | 
                        Dernière activité: {new Date(session.last_activity).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Expire le: {new Date(session.expires_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-50">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Active
                    </Badge>
                  </div>
                ))}
              </div>

              <Alert className="mt-4">
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  <strong>Rotation automatique:</strong> Les sessions expirent automatiquement après 8 heures d'inactivité.
                  La rotation s'effectue toutes les heures via une tâche cron.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protection" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Rate Limiting & DDoS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Protection DDoS</span>
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    Actif
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Rate Limiting (5 req/min)</span>
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    Actif
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Détection d'anomalies</span>
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    Actif
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Chiffrement des données</span>
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    AES-256
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Authentification Avancée
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Mots de passe forts (ANSSI)</span>
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    Activé
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Hashage bcrypt</span>
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    12 rounds
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Verrouillage automatique</span>
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    5 tentatives
                  </Badge>
                </div>
                <Button variant="outline" className="w-full" disabled>
                  <Key className="w-4 h-4 mr-2" />
                  2FA/MFA (Bientôt disponible)
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Alertes de Sécurité par Email
              </CardTitle>
              <CardDescription>
                Configuration des notifications automatiques
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Tentatives de connexion suspectes</p>
                    <p className="text-sm text-muted-foreground">Plus de 5 tentatives en 10 minutes</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    Activé
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Connexions multiples IP</p>
                    <p className="text-sm text-muted-foreground">Plus de 3 IP différentes en 1 heure</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    Activé
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Événements critiques</p>
                    <p className="text-sm text-muted-foreground">Alertes pour tous les événements critiques</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    Activé
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button 
                  onClick={() => testEmailAlertMutation.mutate()}
                  disabled={testEmailAlertMutation.isPending}
                  className="w-full"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Tester les Alertes Email
                </Button>
              </div>

              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  <strong>API REST Sécurisée:</strong> Toutes les API sont protégées par authentification JWT,
                  rate limiting et validation des données. Logs structurés en format JSON pour analyse.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSecurity;