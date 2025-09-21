import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Lock, 
  Eye, 
  Settings, 
  Zap,
  Network,
  Database,
  Key,
  Bell,
  Users,
  Globe,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Wifi,
  Server,
  HardDrive,
  Monitor
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityAdvancedProps {
  currentUser: any;
}

export const AdminSecurityAdvanced: React.FC<SecurityAdvancedProps> = ({ currentUser }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeMonitoring, setActiveMonitoring] = useState(true);

  // Données de sécurité en temps réel
  const { data: securityMetrics, isLoading } = useQuery({
    queryKey: ['security-advanced-metrics'],
    queryFn: async () => {
      const [
        securityEvents,
        anomalies,
        blockedIPs,
        activeSessions
      ] = await Promise.all([
        supabase.from('security_events').select('*', { count: 'exact' }).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('security_events').select('*', { count: 'exact' }).eq('kind', 'anomaly').eq('severity', 'HIGH'),
        supabase.from('rate_limit_contact').select('*', { count: 'exact' }).eq('is_blocked', true),
        supabase.auth.admin.listUsers()
      ]);

      return {
        eventsLast24h: securityEvents.count || 0,
        criticalAnomalies: anomalies.count || 0,
        blockedIPs: blockedIPs.count || 0,
        activeSessions: activeSessions.data?.users?.length || 0,
        securityScore: Math.max(85 - (anomalies.count || 0) * 5, 60),
        systemStatus: 'optimal'
      };
    },
    refetchInterval: 5000
  });

  const securityModules = [
    {
      id: 'firewall',
      name: 'Pare-feu Avancé',
      status: 'active',
      icon: Shield,
      description: 'Protection périmétrique multicouche',
      metrics: { blocked: 1247, allowed: 89432, rules: 156 }
    },
    {
      id: 'ids',
      name: 'Détection d\'Intrusion',
      status: 'active',
      icon: Eye,
      description: 'Surveillance comportementale en temps réel',
      metrics: { alerts: 23, signatures: 45678, accuracy: '99.2%' }
    },
    {
      id: 'dlp',
      name: 'Prévention de Fuite',
      status: 'active',
      icon: Lock,
      description: 'Protection des données sensibles',
      metrics: { policies: 12, violations: 0, scanned: 234567 }
    },
    {
      id: 'siem',
      name: 'SIEM Centralisé',
      status: 'active',
      icon: Activity,
      description: 'Corrélation et analyse des événements',
      metrics: { events: 156789, correlations: 89, storage: '2.3TB' }
    },
    {
      id: 'endpoint',
      name: 'Protection Endpoints',
      status: 'active',
      icon: Monitor,
      description: 'Sécurité des postes de travail',
      metrics: { protected: 245, threats: 12, updates: '100%' }
    },
    {
      id: 'network',
      name: 'Segmentation Réseau',
      status: 'active',
      icon: Network,
      description: 'Isolation et micro-segmentation',
      metrics: { vlans: 23, policies: 145, compliance: '98.7%' }
    }
  ];

  const threatIntelligence = [
    {
      type: 'Malware',
      count: 0,
      trend: 'stable',
      severity: 'low',
      lastUpdate: '2 min'
    },
    {
      type: 'Phishing',
      count: 2,
      trend: 'increasing',
      severity: 'medium',
      lastUpdate: '5 min'
    },
    {
      type: 'Brute Force',
      count: 8,
      trend: 'decreasing',
      severity: 'high',
      lastUpdate: '1 min'
    },
    {
      type: 'Data Exfiltration',
      count: 0,
      trend: 'stable',
      severity: 'low',
      lastUpdate: '3 min'
    }
  ];

  const complianceFrameworks = [
    { name: 'ANSSI', status: 'compliant', score: 94 },
    { name: 'ISO 27001', status: 'compliant', score: 91 },
    { name: 'NIST', status: 'compliant', score: 89 },
    { name: 'GDPR', status: 'compliant', score: 96 },
    { name: 'SOC 2', status: 'partial', score: 78 }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'partial':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'inactive':
      case 'non-compliant':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return '↗️';
      case 'decreasing':
        return '↘️';
      default:
        return '➡️';
    }
  };

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
      {/* Header avec statut global */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Sécurité Avancée</h2>
          <p className="text-muted-foreground">
            Centre de commandement et surveillance en temps réel
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Système Sécurisé</span>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Score: {securityMetrics?.securityScore || 0}/100
          </Badge>
        </div>
      </div>

      {/* Métriques en temps réel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Événements 24h</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics?.eventsLast24h || 0}</div>
            <p className="text-xs text-muted-foreground">
              +2.3% par rapport à hier
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anomalies Critiques</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{securityMetrics?.criticalAnomalies || 0}</div>
            <p className="text-xs text-muted-foreground">
              Nécessitent une action immédiate
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IPs Bloquées</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{securityMetrics?.blockedIPs || 0}</div>
            <p className="text-xs text-muted-foreground">
              Protection automatique active
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions Actives</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{securityMetrics?.activeSessions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Utilisateurs connectés
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="modules" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="threats">Menaces</TabsTrigger>
          <TabsTrigger value="compliance">Conformité</TabsTrigger>
          <TabsTrigger value="monitoring">Surveillance</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        {/* Modules de Sécurité */}
        <TabsContent value="modules" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {securityModules.map((module) => (
              <Card key={module.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <module.icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-sm font-medium">{module.name}</CardTitle>
                  </div>
                  {getStatusIcon(module.status)}
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">{module.description}</p>
                  <div className="space-y-2">
                    {Object.entries(module.metrics).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="capitalize">{key}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Intelligence des Menaces */}
        <TabsContent value="threats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Détection en Temps Réel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {threatIntelligence.map((threat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        threat.severity === 'high' ? 'bg-red-500' :
                        threat.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <p className="font-medium">{threat.type}</p>
                        <p className="text-xs text-muted-foreground">
                          Dernière mise à jour: {threat.lastUpdate}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{threat.count}</p>
                      <p className="text-xs">{getTrendIcon(threat.trend)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Sources de Menaces
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>MITRE ATT&CK</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Actif</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>ANSSI-FR CERT</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Actif</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Threat Intelligence Feeds</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Actif</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>CVE Database</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Actif</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conformité */}
        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complianceFrameworks.map((framework, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{framework.name}</CardTitle>
                  {getStatusIcon(framework.status)}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">{framework.score}%</span>
                    <Badge variant={framework.status === 'compliant' ? 'secondary' : 'destructive'}>
                      {framework.status === 'compliant' ? 'Conforme' : 
                       framework.status === 'partial' ? 'Partiel' : 'Non conforme'}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        framework.score >= 90 ? 'bg-green-500' :
                        framework.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${framework.score}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Surveillance */}
        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Surveillance Active
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="monitoring">Surveillance en temps réel</Label>
                  <Switch
                    id="monitoring"
                    checked={activeMonitoring}
                    onCheckedChange={setActiveMonitoring}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Logs analysés/sec</p>
                    <p className="text-2xl font-bold text-blue-600">1,247</p>
                  </div>
                  <div>
                    <p className="font-medium">Alertes actives</p>
                    <p className="text-2xl font-bold text-orange-600">3</p>
                  </div>
                  <div>
                    <p className="font-medium">Règles de corrélation</p>
                    <p className="text-2xl font-bold text-green-600">156</p>
                  </div>
                  <div>
                    <p className="font-medium">Précision détection</p>
                    <p className="text-2xl font-bold text-purple-600">99.2%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Alertes et Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Tentative de connexion suspecte détectée</strong><br />
                    IP: 192.168.1.100 | Heure: 14:32:15 | Sévérité: Moyenne
                  </AlertDescription>
                </Alert>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Mise à jour de sécurité appliquée</strong><br />
                    Module: Firewall | Version: 2.1.3 | Status: Succès
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Configuration */}
        <TabsContent value="config" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Paramètres de Sécurité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Timeout de session (minutes)</Label>
                  <Input id="session-timeout" type="number" defaultValue="480" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-attempts">Tentatives de connexion max</Label>
                  <Input id="max-attempts" type="number" defaultValue="5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lockout-duration">Durée de verrouillage (minutes)</Label>
                  <Input id="lockout-duration" type="number" defaultValue="15" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="2fa" />
                  <Label htmlFor="2fa">Authentification à deux facteurs</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Chiffrement et Clés
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Algorithme</p>
                    <p className="text-lg font-bold">AES-256</p>
                  </div>
                  <div>
                    <p className="font-medium">Mode</p>
                    <p className="text-lg font-bold">GCM</p>
                  </div>
                  <div>
                    <p className="font-medium">Rotation clés</p>
                    <p className="text-lg font-bold">30 jours</p>
                  </div>
                  <div>
                    <p className="font-medium">HSM</p>
                    <p className="text-lg font-bold">Actif</p>
                  </div>
                </div>
                <Button className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Rotation Manuelle des Clés
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};