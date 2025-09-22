import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Eye, 
  Activity,
  Server,
  Database,
  Globe,
  Users,
  Zap,
  Bell,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Cpu,
  HardDrive,
  Wifi,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SecurityMetrics {
  score: number;
  threats: number;
  vulnerabilities: number;
  incidents: number;
  compliance: number;
}

interface ThreatIntel {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  source: string;
  timestamp: string;
  status: 'ACTIVE' | 'MITIGATED' | 'INVESTIGATING';
}

export const AdminSecurityAdvanced: React.FC<{ currentUser: any }> = ({ currentUser }) => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    score: 92,
    threats: 3,
    vulnerabilities: 7,
    incidents: 1,
    compliance: 98
  });
  
  const [threats, setThreats] = useState<ThreatIntel[]>([
    {
      id: '1',
      type: 'Brute Force Attack',
      severity: 'HIGH',
      description: 'Multiple failed login attempts detected from IP 192.168.1.100',
      source: 'IDS',
      timestamp: new Date().toISOString(),
      status: 'ACTIVE'
    },
    {
      id: '2',
      type: 'SQL Injection Attempt',
      severity: 'CRITICAL',
      description: 'Malicious SQL queries detected in web application logs',
      source: 'WAF',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'MITIGATED'
    },
    {
      id: '3',
      type: 'Suspicious File Upload',
      severity: 'MEDIUM',
      description: 'Potentially malicious file upload attempt blocked',
      source: 'File Scanner',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'INVESTIGATING'
    }
  ]);

  const [scanResults, setScanResults] = useState({
    lastScan: '2025-01-22 08:30:00',
    vulnerabilities: {
      critical: 1,
      high: 3,
      medium: 8,
      low: 15
    },
    compliance: {
      anssi: 95,
      iso27001: 92,
      gdpr: 98,
      nist: 89
    }
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-black';
      case 'LOW': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-red-100 text-red-800';
      case 'MITIGATED': return 'bg-green-100 text-green-800';
      case 'INVESTIGATING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const runSecurityScan = async () => {
    toast({
      title: "Scan de sécurité lancé",
      description: "Analyse complète en cours...",
    });

    // Simulation d'un scan
    setTimeout(() => {
      setScanResults({
        ...scanResults,
        lastScan: new Date().toLocaleString('fr-FR')
      });
      
      toast({
        title: "Scan terminé",
        description: "Aucune nouvelle vulnérabilité critique détectée",
      });
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Sécurité Avancée
          </h2>
          <p className="text-muted-foreground">
            Surveillance et analyse avancée de la sécurité système
          </p>
        </div>
        <Button onClick={runSecurityScan} className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Lancer Scan Complet
        </Button>
      </div>

      {/* Métriques de sécurité */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score Sécurité</p>
                <div className="text-2xl font-bold text-green-600">{metrics.score}%</div>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={metrics.score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Menaces Actives</p>
                <div className="text-2xl font-bold text-red-600">{metrics.threats}</div>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vulnérabilités</p>
                <div className="text-2xl font-bold text-orange-600">{metrics.vulnerabilities}</div>
              </div>
              <Eye className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Incidents</p>
                <div className="text-2xl font-bold text-yellow-600">{metrics.incidents}</div>
              </div>
              <Bell className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conformité</p>
                <div className="text-2xl font-bold text-blue-600">{metrics.compliance}%</div>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="threats" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="threats">Threat Intelligence</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="compliance">Conformité</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>

        {/* Threat Intelligence */}
        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Menaces en Temps Réel
              </CardTitle>
              <CardDescription>
                Surveillance et analyse des menaces de sécurité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threats.map((threat) => (
                  <div key={threat.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(threat.severity)}>
                          {threat.severity}
                        </Badge>
                        <h4 className="font-medium">{threat.type}</h4>
                        <Badge variant="outline" className={getStatusColor(threat.status)}>
                          {threat.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{threat.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Source: {threat.source}</span>
                        <span>Détecté: {new Date(threat.timestamp).toLocaleString('fr-FR')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm">
                        Traiter
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring */}
        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  Serveurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12/12</div>
                <p className="text-sm text-green-600">Tous opérationnels</p>
                <Progress value={100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Bases de Données
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8/8</div>
                <p className="text-sm text-green-600">Sécurisées</p>
                <Progress value={100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Pare-feu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.9%</div>
                <p className="text-sm text-green-600">Uptime</p>
                <Progress value={99.9} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  CPU Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24%</div>
                <p className="text-sm text-green-600">Normal</p>
                <Progress value={24} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Stockage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">67%</div>
                <p className="text-sm text-yellow-600">Surveiller</p>
                <Progress value={67} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  Réseau
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156 MB/s</div>
                <p className="text-sm text-green-600">Optimal</p>
                <Progress value={85} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conformité */}
        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Standards de Conformité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">ANSSI</span>
                    <span className="text-sm text-green-600">{scanResults.compliance.anssi}%</span>
                  </div>
                  <Progress value={scanResults.compliance.anssi} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">ISO 27001</span>
                    <span className="text-sm text-green-600">{scanResults.compliance.iso27001}%</span>
                  </div>
                  <Progress value={scanResults.compliance.iso27001} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">RGPD</span>
                    <span className="text-sm text-green-600">{scanResults.compliance.gdpr}%</span>
                  </div>
                  <Progress value={scanResults.compliance.gdpr} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">NIST</span>
                    <span className="text-sm text-yellow-600">{scanResults.compliance.nist}%</span>
                  </div>
                  <Progress value={scanResults.compliance.nist} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analyse des Vulnérabilités</CardTitle>
                <CardDescription>
                  Dernier scan: {scanResults.lastScan}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{scanResults.vulnerabilities.critical}</div>
                    <p className="text-sm text-muted-foreground">Critiques</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{scanResults.vulnerabilities.high}</div>
                    <p className="text-sm text-muted-foreground">Élevées</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{scanResults.vulnerabilities.medium}</div>
                    <p className="text-sm text-muted-foreground">Moyennes</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{scanResults.vulnerabilities.low}</div>
                    <p className="text-sm text-muted-foreground">Faibles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Infrastructure */}
        <TabsContent value="infrastructure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                État de l'Infrastructure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Services Critiques</h4>
                  <div className="space-y-2">
                    {[
                      { name: 'Web Server', status: 'online' },
                      { name: 'Database', status: 'online' },
                      { name: 'Mail Server', status: 'warning' },
                      { name: 'DNS', status: 'online' },
                      { name: 'Backup', status: 'online' }
                    ].map((service) => (
                      <div key={service.name} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{service.name}</span>
                        {service.status === 'online' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : service.status === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Sécurité Réseau</h4>
                  <div className="space-y-2">
                    {[
                      { name: 'Firewall Principal', status: 'online' },
                      { name: 'IDS/IPS', status: 'online' },
                      { name: 'VPN Gateway', status: 'online' },
                      { name: 'WAF', status: 'online' },
                      { name: 'Proxy', status: 'warning' }
                    ].map((service) => (
                      <div key={service.name} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{service.name}</span>
                        {service.status === 'online' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : service.status === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Monitoring</h4>
                  <div className="space-y-2">
                    {[
                      { name: 'SIEM', status: 'online' },
                      { name: 'Log Collector', status: 'online' },
                      { name: 'Vulnerability Scanner', status: 'online' },
                      { name: 'Network Monitor', status: 'online' },
                      { name: 'Alerting System', status: 'online' }
                    ].map((service) => (
                      <div key={service.name} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{service.name}</span>
                        {service.status === 'online' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : service.status === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rapports */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Rapports Automatisés
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Rapport Journalier Sécurité', status: 'Généré', time: '08:00' },
                  { name: 'Analyse Vulnérabilités', status: 'En cours', time: '14:30' },
                  { name: 'Conformité Mensuelle', status: 'Planifié', time: 'Demain' },
                  { name: 'Audit Logs', status: 'Généré', time: '06:00' }
                ].map((report) => (
                  <div key={report.name} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-medium text-sm">{report.name}</h4>
                      <p className="text-xs text-muted-foreground">{report.time}</p>
                    </div>
                    <Badge variant={report.status === 'Généré' ? 'default' : 'secondary'}>
                      {report.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tendances Sécurité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Incidents cette semaine</span>
                    <span className="text-sm font-medium text-green-600">-23%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Vulnérabilités corrigées</span>
                    <span className="text-sm font-medium text-green-600">+15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Temps de réponse moyen</span>
                    <span className="text-sm font-medium text-green-600">-12min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Score de conformité</span>
                    <span className="text-sm font-medium text-green-600">+3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};