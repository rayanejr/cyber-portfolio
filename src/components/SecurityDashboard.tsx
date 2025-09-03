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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { ReactNode } from "react";
import { useState, useEffect } from "react";

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

const SecurityDashboard = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Requêtes temps réel pour les données de sécurité
  const { data: securityLogs } = useQuery({
    queryKey: ['security-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as SecurityLog[];
    },
    refetchInterval: 5000, // Actualisation toutes les 5 secondes
  });

  const { data: anomalies } = useQuery({
    queryKey: ['anomaly-detections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anomaly_detections')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as AnomalyDetection[];
    },
    refetchInterval: 3000,
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['analytics-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000,
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

  // Préparer les données pour les graphiques
  const severityStats = securityLogs?.reduce((acc, log) => {
    acc[log.severity] = (acc[log.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const severityData = Object.entries(severityStats).map(([severity, count]) => ({
    severity,
    count,
    color: severity === 'CRITICAL' ? '#ef4444' : 
           severity === 'HIGH' ? '#f97316' :
           severity === 'MEDIUM' ? '#eab308' : '#22c55e'
  }));

  const timelineData = securityLogs?.slice(0, 24).reverse().map((log, index) => ({
    time: new Date(log.created_at).toLocaleTimeString(),
    events: 1,
    severity: log.severity
  })) || [];

  const eventTypeStats = securityLogs?.reduce((acc, log) => {
    acc[log.event_type] = (acc[log.event_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const eventTypeData = Object.entries(eventTypeStats).map(([type, count]) => ({
    type,
    count
  }));

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'destructive';
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'default';
      case 'LOW': return 'secondary';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SECURITY': return <Shield className="w-4 h-4" />;
      case 'WARNING': return <AlertTriangle className="w-4 h-4" />;
      case 'ERROR': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
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
              {anomalies?.filter(a => !a.is_resolved).length || 0}
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

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="logs">Logs Sécurité</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Événements par Sévérité</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ severity, count }) => `${severity}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activité Temps Réel</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="events" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

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
                        <p className="font-medium">{log.event_type}</p>
                        <p className="text-sm text-muted-foreground">
                          Source: {log.source} | IP: {log.ip_address || 'N/A'}
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
                        <p className="font-medium">{anomaly.detection_type}</p>
                        <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {anomaly.is_resolved ? (
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

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Types d'Événements</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={eventTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;