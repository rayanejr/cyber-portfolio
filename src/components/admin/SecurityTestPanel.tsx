import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Shield, 
  TestTube, 
  Database, 
  Mail, 
  Lock, 
  Activity,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

export function SecurityTestPanel() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);

  const runTest = async (testType: string, description: string) => {
    setLoading(testType);
    try {
      let response;
      
      switch (testType) {
        case 'generate-test-data':
          response = await supabase.functions.invoke('security-test-data', {
            body: { action: 'generate-all' }
          });
          break;
          
        case 'test-encryption':
          response = await supabase.functions.invoke('encryption-service', {
            body: {},
            headers: { 'Content-Type': 'application/json' }
          });
          break;
          
        case 'test-email-alerts':
          response = await supabase.functions.invoke('security-test-data', {
            body: { action: 'test-alerts' }
          });
          break;
          
        case 'run-automation':
          response = await supabase.functions.invoke('security-automation', {
            body: { action: 'run-all' }
          });
          break;
          
        case 'vulnerability-scan':
          response = await supabase.functions.invoke('security-monitor', {
            body: {},
            headers: { 'Content-Type': 'application/json' }
          });
          break;
          
        default:
          throw new Error('Test non reconnu');
      }

      if (response.error) {
        throw new Error(response.error.message);
      }

      setResults({ ...results, [testType]: response.data });
      
      toast({
        title: "✅ Test réussi",
        description: `${description} exécuté avec succès`,
      });
      
    } catch (error: any) {
      console.error(`Erreur lors du test ${testType}:`, error);
      toast({
        title: "❌ Erreur de test",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const testSuites = [
    {
      id: 'generate-test-data',
      title: 'Génération de données de test',
      description: 'Créer des logs, anomalies et données de test pour activer le système',
      icon: Database,
      color: 'bg-blue-500'
    },
    {
      id: 'test-encryption',
      title: 'Test chiffrement AES-256',
      description: 'Tester le chiffrement et déchiffrement des données sensibles',
      icon: Lock,
      color: 'bg-green-500'
    },
    {
      id: 'test-email-alerts',
      title: 'Test alertes email',
      description: 'Simuler des alertes de sécurité et tester les notifications',
      icon: Mail,
      color: 'bg-orange-500'
    },
    {
      id: 'run-automation',
      title: 'Automation sécurité',
      description: 'Exécuter les tâches automatisées (rotation sessions, nettoyage)',
      icon: RefreshCw,
      color: 'bg-purple-500'
    },
    {
      id: 'vulnerability-scan',
      title: 'Scan vulnérabilités',
      description: 'Effectuer un scan de sécurité complet du système',
      icon: Shield,
      color: 'bg-red-500'
    }
  ];

  const getStatusIcon = (testId: string) => {
    if (loading === testId) return RefreshCw;
    if (results?.[testId]) return CheckCircle;
    return TestTube;
  };

  const getStatusColor = (testId: string) => {
    if (loading === testId) return 'text-blue-500 animate-spin';
    if (results?.[testId]) return 'text-green-500';
    return 'text-gray-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TestTube className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Panel de Tests Sécurité</h2>
        <Badge variant="outline">ENVIRONNEMENT DE TEST</Badge>
      </div>

      <div className="grid gap-4">
        {testSuites.map((test) => {
          const StatusIcon = getStatusIcon(test.id);
          
          return (
            <Card key={test.id} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${test.color} text-white`}>
                      <test.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{test.title}</CardTitle>
                      <CardDescription>{test.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`h-5 w-5 ${getStatusColor(test.id)}`} />
                    <Button
                      onClick={() => runTest(test.id, test.title)}
                      disabled={loading === test.id}
                      size="sm"
                    >
                      {loading === test.id ? 'En cours...' : 'Exécuter'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {results?.[test.id] && (
                <CardContent>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-medium text-green-600 mb-2">
                      ✅ Test exécuté avec succès
                    </p>
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(results[test.id], null, 2)}
                    </pre>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actions Rapides
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => runTest('generate-test-data', 'Génération complète')}
              disabled={loading !== null}
            >
              🚀 Activer tout le système
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setResults(null);
                toast({ title: "Résultats effacés" });
              }}
            >
              🧹 Nettoyer les résultats
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('/admin', '_blank')}
            >
              📊 Voir Dashboard Sécurité
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
            <p><strong>💡 Conseil :</strong> Commencez par "Génération de données de test" pour créer les données nécessaires, puis testez les autres fonctionnalités.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}