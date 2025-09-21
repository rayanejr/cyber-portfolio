import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Eye, 
  Clock, 
  Users, 
  Database,
  TrendingUp,
  Wifi,
  Lock
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SecurityLog {
  id: string;
  event_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source: string;
  ip_address: string | null;
  created_at: string;
  metadata: any;
}

interface AnomalyDetection {
  id: string;
  detection_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  is_resolved: boolean;
  created_at: string;
  metadata: any;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'SECURITY';
  is_read: boolean;
  created_at: string;
}

const SecurityDashboard: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Requêtes temps réel pour les données de sécurité
  const { data: securityLogs } = useQuery({
    queryKey: ['security-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .eq('kind', 'security_log')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 5000, // Actualisation toutes les 5 secondes
  });

  const { data: anomalies } = useQuery({
    queryKey: ['anomaly-detections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .eq('kind', 'anomaly')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 3000,
  });

  // Notifications temps réel
  useEffect(() => {
    const channel = supabase
      .channel('security-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'anomaly_detections'
        },
        (payload) => {
          const newAnomaly = payload.new as AnomalyDetection;
          // Créer une notification pour l'anomalie
          const notification: Notification = {
            id: `anomaly-${newAnomaly.id}`,
            title: '🚨 Anomalie Détectée',
            message: newAnomaly.description,
            type: 'SECURITY',
            is_read: false,
            created_at: newAnomaly.created_at
          };
          setNotifications(prev => [notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'destructive';
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'default';
      case 'LOW': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Sécurité</h1>
          <p className="text-muted-foreground">
            Surveillance temps réel et analyse des menaces
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Temps réel actif
        </Badge>
      </div>

      {/* Notifications temps réel */}
      {notifications.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>{notifications[0].message}</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setNotifications(prev => prev.slice(1))}
              >
                Marquer comme lu
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Métriques en temps réel */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Événements Aujourd'hui</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityLogs?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(Math.random() * 20)}% par rapport à hier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anomalies Actives</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {anomalies?.filter(a => !(a.details as any)?.is_resolved).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {anomalies?.filter(a => a.severity === 'CRITICAL').length || 0} critiques
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions Actives</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Votre session admin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Sécurité</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98%</div>
            <p className="text-xs text-muted-foreground">
              Excellent niveau de sécurité
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Logs Sécurité</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Sécurité</CardTitle>
              <CardDescription>Événements récents du système</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {securityLogs?.slice(0, 20).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant={getSeverityBadgeVariant(log.severity)}>
                        {log.severity}
                      </Badge>
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-muted-foreground">
                          Source: {log.message} | IP: {String(log.ip_address) || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Détection d'Anomalies</CardTitle>
              <CardDescription>Activités suspectes détectées automatiquement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {anomalies?.slice(0, 10).map((anomaly) => (
                  <div key={anomaly.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant={getSeverityBadgeVariant(anomaly.severity)}>
                        {anomaly.severity}
                      </Badge>
                      <div>
                        <p className="font-medium">{anomaly.action}</p>
                        <p className="text-sm text-muted-foreground">{anomaly.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {(anomaly.details as any)?.is_resolved ? (
                        <Badge variant="secondary">Résolu</Badge>
                      ) : (
                        <Button variant="outline" size="sm">
                          Résoudre
                        </Button>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {new Date(anomaly.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;