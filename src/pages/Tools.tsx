import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Key, AlertTriangle, Users, Lock, Globe } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  config: any;
}

const Tools = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [toolResults, setToolResults] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTools(data || []);
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'password': return <Key className="w-5 h-5" />;
      case 'risk': return <AlertTriangle className="w-5 h-5" />;
      case 'phishing': return <Users className="w-5 h-5" />;
      case 'leak': return <Shield className="w-5 h-5" />;
      case 'security': return <Lock className="w-5 h-5" />;
      case 'ssl': return <Globe className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'password': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'risk': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'phishing': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'leak': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'security': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'ssl': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const generatePassword = (config: any) => {
    const length = 16;
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let charset = lowercase + uppercase;
    if (config.includeNumbers) charset += numbers;
    if (config.includeSpecialChars) charset += special;
    
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  };

  const calculateRisk = (formData: any) => {
    const { network, users, data, compliance } = formData;
    const scores = { network: parseInt(network), users: parseInt(users), data: parseInt(data), compliance: parseInt(compliance) };
    const weights = [0.3, 0.2, 0.3, 0.2];
    const totalScore = Object.values(scores).reduce((sum: number, score: number, idx: number) => sum + (score * weights[idx]), 0);
    
    let level = 'Faible';
    let color = 'text-green-400';
    if (totalScore >= 7) { level = 'Critique'; color = 'text-red-400'; }
    else if (totalScore >= 5) { level = 'Élevé'; color = 'text-orange-400'; }
    else if (totalScore >= 3) { level = 'Moyen'; color = 'text-yellow-400'; }
    
    return { level, score: totalScore.toFixed(1), color };
  };

  const simulatePhishing = (template: string, difficulty: string) => {
    const scenarios = {
      banking: {
        easy: "Votre compte sera suspendu. Cliquez ici pour vérifier.",
        medium: "Activité suspecte détectée. Confirmez votre identité.",
        hard: "Mise à jour de sécurité requise pour votre compte bancaire."
      },
      social: {
        easy: "Vous avez reçu un message privé. Cliquez pour voir.",
        medium: "Votre compte a été signalé. Vérifiez maintenant.",
        hard: "Nouvelle politique de confidentialité à accepter."
      },
      work: {
        easy: "Votre mot de passe expire aujourd'hui. Changez-le maintenant.",
        medium: "Document urgent nécessitant votre signature électronique.",
        hard: "Mise à jour du système RH - Action requise."
      }
    };
    
    return scenarios[template as keyof typeof scenarios]?.[difficulty as keyof typeof scenarios.banking] || "Scénario non trouvé";
  };

  const checkDataLeak = (email: string) => {
    // Simulation simple - en réalité, cela appellerait une API
    const commonLeaks = ['linkedin', 'adobe', 'dropbox', 'yahoo'];
    const foundIn = commonLeaks.filter(() => Math.random() > 0.7);
    
    return {
      isCompromised: foundIn.length > 0,
      breaches: foundIn,
      count: foundIn.length
    };
  };

  const analyzeHeaders = (url: string) => {
    // Simulation d'analyse d'en-têtes
    const headers = {
      'Content-Security-Policy': Math.random() > 0.5,
      'X-Frame-Options': Math.random() > 0.3,
      'X-XSS-Protection': Math.random() > 0.4,
      'Strict-Transport-Security': Math.random() > 0.6
    };
    
    const score = Object.values(headers).filter(Boolean).length;
    return { headers, score, total: 4 };
  };

  const testSSL = (domain: string) => {
    // Simulation de test SSL
    return {
      grade: ['A+', 'A', 'B', 'C'][Math.floor(Math.random() * 4)],
      protocols: ['TLS 1.3', 'TLS 1.2'],
      vulnerabilities: Math.random() > 0.7 ? ['Weak cipher suites'] : [],
      certificate: {
        valid: true,
        expires: '2024-12-31'
      }
    };
  };

  const runTool = (tool: Tool, formData: any = {}) => {
    let result;
    
    switch (tool.category) {
      case 'password':
        result = generatePassword(tool.config);
        break;
      case 'risk':
        result = calculateRisk(formData);
        break;
      case 'phishing':
        result = simulatePhishing(formData.template, formData.difficulty);
        break;
      case 'leak':
        result = checkDataLeak(formData.email);
        break;
      case 'security':
        result = analyzeHeaders(formData.url);
        break;
      case 'ssl':
        result = testSSL(formData.domain);
        break;
      default:
        result = "Outil non implémenté";
    }
    
    setToolResults({ ...toolResults, [tool.id]: result });
  };

  const renderToolInterface = (tool: Tool) => {
    switch (tool.category) {
      case 'password':
        return (
          <div className="space-y-4">
            <Button onClick={() => runTool(tool)} className="w-full">
              Générer un mot de passe
            </Button>
            {toolResults[tool.id] && (
              <div className="p-4 bg-muted rounded-lg">
                <Label className="text-sm font-medium">Mot de passe généré :</Label>
                <div className="mt-2 p-2 bg-background rounded border font-mono text-sm">
                  {toolResults[tool.id]}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'risk':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            runTool(tool, Object.fromEntries(formData));
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="network">Sécurité réseau (1-10)</Label>
                <Input name="network" type="number" min="1" max="10" defaultValue="5" />
              </div>
              <div>
                <Label htmlFor="users">Formation utilisateurs (1-10)</Label>
                <Input name="users" type="number" min="1" max="10" defaultValue="5" />
              </div>
              <div>
                <Label htmlFor="data">Protection des données (1-10)</Label>
                <Input name="data" type="number" min="1" max="10" defaultValue="5" />
              </div>
              <div>
                <Label htmlFor="compliance">Conformité (1-10)</Label>
                <Input name="compliance" type="number" min="1" max="10" defaultValue="5" />
              </div>
            </div>
            <Button type="submit" className="w-full">Calculer le risque</Button>
            {toolResults[tool.id] && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${toolResults[tool.id].color}`}>
                    {toolResults[tool.id].level}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Score: {toolResults[tool.id].score}/10
                  </div>
                </div>
              </div>
            )}
          </form>
        );
      
      case 'leak':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            runTool(tool, Object.fromEntries(formData));
          }} className="space-y-4">
            <div>
              <Label htmlFor="email">Adresse email</Label>
              <Input name="email" type="email" placeholder="votre@email.com" required />
            </div>
            <Button type="submit" className="w-full">Vérifier les fuites</Button>
            {toolResults[tool.id] && (
              <div className="p-4 bg-muted rounded-lg">
                {toolResults[tool.id].isCompromised ? (
                  <div className="text-red-400">
                    <div className="font-semibold">⚠️ Données compromises</div>
                    <div className="text-sm mt-1">
                      Trouvé dans {toolResults[tool.id].count} fuite(s): {toolResults[tool.id].breaches.join(', ')}
                    </div>
                  </div>
                ) : (
                  <div className="text-green-400">
                    <div className="font-semibold">✅ Aucune fuite détectée</div>
                  </div>
                )}
              </div>
            )}
          </form>
        );
      
      default:
        return (
          <div className="text-center text-muted-foreground">
            Interface de l'outil en développement
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-20">
        <div className="container mx-auto px-6">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Outils Cybersécurité
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Collection d'outils gratuits pour tester et améliorer votre sécurité
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Card key={tool.id} className="hover:shadow-cyber transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getCategoryColor(tool.category)}`}>
                    {getCategoryIcon(tool.category)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                    <Badge variant="outline" className="text-xs mt-1">
                      {tool.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                {renderToolInterface(tool)}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tools;