import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Key, AlertTriangle, Users, Lock, Globe, Terminal, Wifi, Search, Bug, Code, Database, Activity, Wrench } from "lucide-react";

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
    switch (category.toLowerCase()) {
      case 'password': return <Key className="w-5 h-5" />;
      case 'risk': return <AlertTriangle className="w-5 h-5" />;
      case 'phishing': return <Users className="w-5 h-5" />;
      case 'leak': return <Shield className="w-5 h-5" />;
      case 'security': return <Lock className="w-5 h-5" />;
      case 'ssl': return <Globe className="w-5 h-5" />;
      case 'web security': return <Globe className="w-5 h-5" />;
      case 'penetration testing': return <Bug className="w-5 h-5" />;
      case 'network security': return <Wifi className="w-5 h-5" />;
      case 'network analysis': return <Activity className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'password': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'risk': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'phishing': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'leak': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'security': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'ssl': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'web security': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'penetration testing': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'network security': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'network analysis': return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const generatePassword = async (config: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('security-password-generator', {
        body: {
          length: 16,
          includeNumbers: config.includeNumbers,
          includeSpecialChars: config.includeSpecialChars,
          includeUppercase: true,
          includeLowercase: true
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Password generation error:', error);
      return { password: 'Erreur de génération', strength: 'Erreur', entropy: 0 };
    }
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

  const checkDataLeak = async (email: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('security-breach-checker', {
        body: { email }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Breach check error:', error);
      return { 
        error: 'Erreur de vérification',
        isCompromised: false,
        breachCount: 0,
        breaches: []
      };
    }
  };

  const analyzeHeaders = async (url: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('security-header-analyzer', {
        body: { url }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Header analysis error:', error);
      return { error: 'Erreur d\'analyse', score: 0, grade: 'F' };
    }
  };

  const testSSL = async (domain: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('security-ssl-checker', {
        body: { domain }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('SSL test error:', error);
      return { error: 'Erreur de test SSL', grade: 'F', score: 0 };
    }
  };

  const scanVulnerabilities = async (formData: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('security-vulnerability-scanner', {
        body: {
          target: formData.target || 'https://example.com',
          scanType: formData.scanType || 'Security Headers & Configuration'
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Vulnerability scan error:', error);
      return {
        error: 'Erreur de scan',
        scanType: 'Error',
        vulnerabilities: [],
        riskLevel: 'Unknown'
      };
    }
  };

  const simulateMetasploit = (formData: any) => {
    // Simulation de Metasploit
    const exploits = [
      'ms17_010_eternalblue',
      'apache_struts2_content_type_ognl',
      'drupal_drupageddon2',
      'jenkins_script_console',
      'tomcat_mgr_upload'
    ];

    const payloads = [
      'windows/x64/meterpreter/reverse_tcp',
      'linux/x64/meterpreter/reverse_tcp',
      'java/meterpreter/reverse_tcp',
      'cmd/unix/reverse'
    ];

    return {
      target: formData.target || '192.168.1.100',
      exploit: exploits[Math.floor(Math.random() * exploits.length)],
      payload: payloads[Math.floor(Math.random() * payloads.length)],
      status: Math.random() > 0.7 ? 'Success' : 'Failed',
      sessions: Math.random() > 0.7 ? 1 : 0
    };
  };

  const scanPorts = async (formData: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('security-port-scanner', {
        body: {
          target: formData.target || 'example.com',
          scanType: formData.scanType || 'Common Ports Scan'
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Port scan error:', error);
      return {
        error: 'Erreur de scan de ports',
        target: formData.target,
        openPorts: [],
        statistics: { totalScanned: 0, openPorts: 0, closedPorts: 0 }
      };
    }
  };

  const simulateWireshark = (formData: any) => {
    // Simulation de Wireshark
    const protocols = ['HTTP', 'HTTPS', 'TCP', 'UDP', 'DNS', 'ARP', 'ICMP'];
    const capturedPackets = Math.floor(Math.random() * 10000) + 1000;
    
    return {
      interface: formData.interface || 'eth0',
      duration: formData.duration || '5 minutes',
      totalPackets: capturedPackets,
      protocols: protocols.map(proto => ({
        name: proto,
        count: Math.floor(Math.random() * 1000) + 50
      })),
      topTalkers: [
        '192.168.1.1',
        '192.168.1.100',
        '8.8.8.8'
      ],
      suspiciousActivity: Math.random() > 0.8 ? ['Unusual DNS queries', 'High bandwidth usage'] : []
    };
  };

  const runTool = async (tool: Tool, formData: any = {}) => {
    let result;
    
    switch (tool.category) {
      case 'password':
        result = await generatePassword(tool.config);
        break;
      case 'risk':
        result = calculateRisk(formData);
        break;
      case 'phishing':
        result = simulatePhishing(formData.template, formData.difficulty);
        break;
      case 'leak':
        result = await checkDataLeak(formData.email);
        break;
      case 'security':
        result = await analyzeHeaders(formData.url);
        break;
      case 'ssl':
        result = await testSSL(formData.domain);
        break;
      case 'Web Security':
      case 'web security':
        result = await scanVulnerabilities(formData);
        break;
      case 'Penetration Testing':
      case 'penetration testing':
        result = simulateMetasploit(formData);
        break;
      case 'Network Security':
      case 'network security':
        result = await scanPorts(formData);
        break;
      case 'Network Analysis':
      case 'network analysis':
        result = simulateWireshark(formData);
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
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div>
                  <Label className="text-sm font-medium">Mot de passe généré :</Label>
                  <div className="mt-2 p-2 bg-background rounded border font-mono text-sm select-all">
                    {toolResults[tool.id].password}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center p-2 bg-background rounded border">
                    <div className="font-bold text-primary">{toolResults[tool.id].strength}</div>
                    <div className="text-xs text-muted-foreground">Force</div>
                  </div>
                  <div className="text-center p-2 bg-background rounded border">
                    <div className="font-bold">{toolResults[tool.id].entropy} bits</div>
                    <div className="text-xs text-muted-foreground">Entropie</div>
                  </div>
                  <div className="text-center p-2 bg-background rounded border">
                    <div className="font-bold">{toolResults[tool.id].length} chars</div>
                    <div className="text-xs text-muted-foreground">Longueur</div>
                  </div>
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
            {toolResults[tool.id] && !toolResults[tool.id].error && (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                {toolResults[tool.id].isCompromised ? (
                  <>
                    <div className="text-red-400 font-semibold">
                      ⚠️ {toolResults[tool.id].breachCount} fuite(s) de données détectée(s)
                    </div>
                    <div className="space-y-2">
                      {toolResults[tool.id].breaches.map((breach: any, idx: number) => (
                        <div key={idx} className="p-2 bg-background rounded border border-red-500/20">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{breach.name}</div>
                              <div className="text-xs text-muted-foreground">{breach.date}</div>
                            </div>
                            <Badge variant="destructive">{breach.severity}</Badge>
                          </div>
                          <div className="text-xs mt-1 text-muted-foreground">
                            {breach.records.toLocaleString()} enregistrements affectés
                          </div>
                          <div className="text-xs mt-1">
                            Données: {breach.dataTypes.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-sm">
                      <div className="font-semibold mb-2">Recommandations:</div>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {toolResults[tool.id].recommendations.map((rec: string, idx: number) => (
                          <li key={idx}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="text-green-400">
                    <div className="font-semibold">✅ Aucune fuite détectée</div>
                    <div className="text-sm mt-2 text-muted-foreground">
                      Votre email n'apparaît pas dans les fuites de données connues.
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
        );

      case 'security':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            runTool(tool, Object.fromEntries(formData));
          }} className="space-y-4">
            <div>
              <Label htmlFor="url">URL du site web</Label>
              <Input name="url" type="url" placeholder="https://example.com" required />
            </div>
            <Button type="submit" className="w-full">Analyser les en-têtes</Button>
            {toolResults[tool.id] && !toolResults[tool.id].error && (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <div className="font-semibold">Score: {toolResults[tool.id].score}%</div>
                  <Badge className={
                    toolResults[tool.id].grade.startsWith('A') ? 'bg-green-500' :
                    toolResults[tool.id].grade.startsWith('B') ? 'bg-blue-500' :
                    toolResults[tool.id].grade.startsWith('C') ? 'bg-yellow-500' :
                    'bg-red-500'
                  }>
                    {toolResults[tool.id].grade}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {Object.entries(toolResults[tool.id].securityHeaders).map(([header, info]: [string, any]) => (
                    <div key={header} className="flex justify-between items-center p-2 bg-background rounded">
                      <div>
                        <div className="text-sm font-medium">{header}</div>
                        <div className="text-xs text-muted-foreground">{info.description}</div>
                      </div>
                      <span className={info.present ? 'text-green-400' : 'text-red-400'}>
                        {info.present ? '✅' : '❌'}
                      </span>
                    </div>
                  ))}
                </div>
                {toolResults[tool.id].recommendations && toolResults[tool.id].recommendations.length > 0 && (
                  <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                    <div className="font-semibold text-sm mb-2">Recommandations :</div>
                    <ul className="text-xs space-y-1">
                      {toolResults[tool.id].recommendations.map((rec: any, idx: number) => (
                        <li key={idx}>• {rec.header}: {rec.description}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </form>
        );

      case 'ssl':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            runTool(tool, Object.fromEntries(formData));
          }} className="space-y-4">
            <div>
              <Label htmlFor="domain">Nom de domaine</Label>
              <Input name="domain" type="text" placeholder="example.com" required />
            </div>
            <Button type="submit" className="w-full">Tester SSL/TLS</Button>
            {toolResults[tool.id] && !toolResults[tool.id].error && (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <div className="font-semibold">Score: {toolResults[tool.id].score}%</div>
                  <Badge className={
                    toolResults[tool.id].grade.startsWith('A') ? 'bg-green-500' :
                    toolResults[tool.id].grade.startsWith('B') ? 'bg-blue-500' :
                    toolResults[tool.id].grade.startsWith('C') ? 'bg-yellow-500' :
                    'bg-red-500'
                  }>
                    {toolResults[tool.id].grade}
                  </Badge>
                </div>
                {toolResults[tool.id].ssl && toolResults[tool.id].ssl.enabled && (
                  <>
                    <div className="p-2 bg-background rounded">
                      <div className="font-semibold text-sm">Protocole:</div>
                      <div className="text-sm">{toolResults[tool.id].ssl.protocol}</div>
                    </div>
                    <div className="p-2 bg-background rounded">
                      <div className="font-semibold text-sm">HSTS:</div>
                      <div className="text-sm">
                        {toolResults[tool.id].ssl.hsts.enabled ? 
                          `Activé (max-age: ${toolResults[tool.id].ssl.hsts.maxAge}s)` : 
                          'Non configuré'}
                      </div>
                    </div>
                  </>
                )}
                {toolResults[tool.id].issues && toolResults[tool.id].issues.length > 0 && (
                  <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                    <div className="font-semibold text-sm mb-2">Problèmes détectés :</div>
                    <ul className="text-xs space-y-1">
                      {toolResults[tool.id].issues.map((issue: any, idx: number) => (
                        <li key={idx} className={
                          issue.severity === 'critical' ? 'text-red-400' :
                          issue.severity === 'high' ? 'text-orange-400' :
                          'text-yellow-400'
                        }>
                          • [{issue.severity.toUpperCase()}] {issue.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {toolResults[tool.id] && toolResults[tool.id].error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded text-red-400">
                {toolResults[tool.id].error || toolResults[tool.id].ssl?.error}
              </div>
            )}
          </form>
        );

      case 'phishing':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            runTool(tool, Object.fromEntries(formData));
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template">Type de scénario</Label>
                <Select name="template" defaultValue="banking">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banking">Bancaire</SelectItem>
                    <SelectItem value="social">Réseaux sociaux</SelectItem>
                    <SelectItem value="work">Professionnel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulté</Label>
                <Select name="difficulty" defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Facile</SelectItem>
                    <SelectItem value="medium">Moyen</SelectItem>
                    <SelectItem value="hard">Difficile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full">Générer un scénario</Button>
            {toolResults[tool.id] && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="font-semibold mb-2">Scénario de phishing:</div>
                <div className="text-sm italic bg-red-500/10 p-3 rounded border border-red-500/20">
                  "{toolResults[tool.id]}"
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  ⚠️ Ceci est un exemple éducatif. Ne pas utiliser à des fins malveillantes.
                </div>
              </div>
            )}
          </form>
        );

      case 'Web Security':
      case 'web security':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            runTool(tool, Object.fromEntries(formData));
          }} className="space-y-4">
            <div>
              <Label htmlFor="target">URL cible</Label>
              <Input name="target" type="url" placeholder="https://example.com" required />
            </div>
            <div>
              <Label htmlFor="scanType">Type de scan</Label>
              <Select name="scanType" defaultValue="Security Headers & Configuration">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Security Headers & Configuration">En-têtes et configuration</SelectItem>
                  <SelectItem value="Full Security Audit">Audit de sécurité complet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">Lancer le scan de vulnérabilités</Button>
            {toolResults[tool.id] && !toolResults[tool.id].error && (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <div className="font-semibold">Scan terminé</div>
                  <Badge className={
                    toolResults[tool.id].riskLevel === 'Low' ? 'bg-green-500' :
                    toolResults[tool.id].riskLevel === 'Medium' ? 'bg-yellow-500' :
                    toolResults[tool.id].riskLevel === 'High' ? 'bg-orange-500' :
                    'bg-red-500'
                  }>
                    Risque: {toolResults[tool.id].riskLevel}
                  </Badge>
                </div>
                <div className="text-sm">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2 bg-background rounded">
                      <div className="text-xs text-muted-foreground">Vulnérabilités</div>
                      <div className="font-bold">{toolResults[tool.id].totalFound}</div>
                    </div>
                    <div className="p-2 bg-background rounded">
                      <div className="text-xs text-muted-foreground">Tests effectués</div>
                      <div className="font-bold">{toolResults[tool.id].checksPerformed}</div>
                    </div>
                  </div>
                  {toolResults[tool.id].vulnerabilities.map((vuln: any, idx: number) => (
                    <div key={idx} className="p-2 mb-2 bg-background rounded border border-red-500/20">
                      <div className="flex justify-between items-start">
                        <div className="font-medium text-sm">{vuln.type}</div>
                        <Badge variant={vuln.severity === 'HIGH' ? 'destructive' : vuln.severity === 'MEDIUM' ? 'default' : 'secondary'} className="text-xs">
                          {vuln.severity}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{vuln.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        );

      case 'Penetration Testing':
      case 'penetration testing':
        return (
          <Tabs defaultValue="exploit" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="exploit">Exploits</TabsTrigger>
              <TabsTrigger value="payload">Payloads</TabsTrigger>
              <TabsTrigger value="session">Sessions</TabsTrigger>
            </TabsList>
            <TabsContent value="exploit" className="space-y-4">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                runTool(tool, Object.fromEntries(formData));
              }} className="space-y-4">
                <div>
                  <Label htmlFor="target">Cible</Label>
                  <Input name="target" placeholder="192.168.1.100" required />
                </div>
                <Button type="submit" className="w-full">Lancer l'exploit</Button>
                {toolResults[tool.id] && (
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div><strong>Cible:</strong> {toolResults[tool.id].target}</div>
                      <div><strong>Exploit:</strong> {toolResults[tool.id].exploit}</div>
                      <div><strong>Payload:</strong> {toolResults[tool.id].payload}</div>
                      <div className={`font-semibold ${
                        toolResults[tool.id].status === 'Success' ? 'text-green-400' : 'text-red-400'
                      }`}>Statut: {toolResults[tool.id].status}</div>
                      <div><strong>Sessions:</strong> {toolResults[tool.id].sessions}</div>
                    </div>
                  </div>
                )}
              </form>
            </TabsContent>
            <TabsContent value="payload" className="space-y-4">
              <div className="text-center text-muted-foreground">
                <Bug className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Générateur de payloads</p>
                <p className="text-sm">Création de charges utiles personnalisées</p>
              </div>
            </TabsContent>
            <TabsContent value="session" className="space-y-4">
              <div className="text-center text-muted-foreground">
                <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Gestion des sessions</p>
                <p className="text-sm">Contrôle des sessions compromises</p>
              </div>
            </TabsContent>
          </Tabs>
        );

      case 'Network Security':
      case 'network security':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            runTool(tool, Object.fromEntries(formData));
          }} className="space-y-4">
            <div>
              <Label htmlFor="target">Cible (domaine ou IP)</Label>
              <Input name="target" placeholder="example.com" required />
            </div>
            <div>
              <Label htmlFor="scanType">Type de scan</Label>
              <Select name="scanType" defaultValue="Common Ports Scan">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Common Ports Scan">Ports courants</SelectItem>
                  <SelectItem value="Full Port Scan">Scan complet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">Lancer le scan de ports</Button>
            {toolResults[tool.id] && !toolResults[tool.id].error && (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center p-2 bg-background rounded">
                    <div className="font-bold">{toolResults[tool.id].statistics.totalScanned}</div>
                    <div className="text-xs text-muted-foreground">Scannés</div>
                  </div>
                  <div className="text-center p-2 bg-background rounded">
                    <div className="font-bold text-green-400">{toolResults[tool.id].statistics.openPorts}</div>
                    <div className="text-xs text-muted-foreground">Ouverts</div>
                  </div>
                  <div className="text-center p-2 bg-background rounded">
                    <div className="font-bold">{toolResults[tool.id].statistics.closedPorts}</div>
                    <div className="text-xs text-muted-foreground">Fermés</div>
                  </div>
                </div>
                {toolResults[tool.id].openPorts.length > 0 && (
                  <div>
                    <div className="font-semibold text-sm mb-2">Ports ouverts:</div>
                    <div className="space-y-1">
                      {toolResults[tool.id].openPorts.map((port: any, idx: number) => (
                        <div key={idx} className="p-2 bg-background rounded text-xs flex justify-between items-center">
                          <div>
                            <span className="font-medium">Port {port.port}</span> - {port.service}
                          </div>
                          <Badge variant="outline" className="text-xs">{port.category}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {toolResults[tool.id].securityIssues && toolResults[tool.id].securityIssues.length > 0 && (
                  <div>
                    <div className="font-semibold text-sm mb-2 text-red-400">⚠️ Problèmes de sécurité:</div>
                    <div className="space-y-1">
                      {toolResults[tool.id].securityIssues.map((issue: any, idx: number) => (
                        <div key={idx} className="p-2 bg-background rounded border border-red-500/20 text-xs">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium">{issue.issue}</span>
                            <Badge variant="destructive" className="text-xs">{issue.severity}</Badge>
                          </div>
                          <div className="text-muted-foreground">{issue.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
        );

      case 'Network Analysis':
      case 'network analysis':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            runTool(tool, Object.fromEntries(formData));
          }} className="space-y-4">
            <div>
              <Label htmlFor="interface">Interface réseau</Label>
              <Select name="interface" defaultValue="eth0">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eth0">eth0</SelectItem>
                  <SelectItem value="wlan0">wlan0</SelectItem>
                  <SelectItem value="lo">loopback</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="duration">Durée de capture</Label>
              <Select name="duration" defaultValue="5 minutes">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 minute">1 minute</SelectItem>
                  <SelectItem value="5 minutes">5 minutes</SelectItem>
                  <SelectItem value="10 minutes">10 minutes</SelectItem>
                  <SelectItem value="30 minutes">30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">Démarrer la capture</Button>
            {toolResults[tool.id] && (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Interface:</strong> {toolResults[tool.id].interface}</div>
                  <div><strong>Durée:</strong> {toolResults[tool.id].duration}</div>
                  <div><strong>Paquets:</strong> {toolResults[tool.id].totalPackets.toLocaleString()}</div>
                </div>
                <div>
                  <div className="font-semibold mb-2">Protocoles détectés:</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {toolResults[tool.id].protocols.map((proto: any, idx: number) => (
                      <div key={idx} className="flex justify-between">
                        <span>{proto.name}</span>
                        <span className="text-blue-400">{proto.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="font-semibold mb-2">Top des communicants:</div>
                  <div className="text-sm space-y-1">
                    {toolResults[tool.id].topTalkers.map((ip: string, idx: number) => (
                      <div key={idx}>{ip}</div>
                    ))}
                  </div>
                </div>
                {toolResults[tool.id].suspiciousActivity.length > 0 && (
                  <div>
                    <div className="font-semibold text-red-400 mb-2">Activité suspecte:</div>
                    <ul className="text-sm space-y-1">
                      {toolResults[tool.id].suspiciousActivity.map((activity: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="text-red-400">•</span>
                          {activity}
                        </li>
                      ))}
                    </ul>
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
      <div className="min-h-screen bg-background py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-2/3 sm:w-1/3 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-4/5 sm:w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 cyber-grid opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
      
      <div className="relative py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Enhanced header */}
          <div className="text-center mb-12 sm:mb-16 animate-fade-in">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-3 h-3 bg-secondary rounded-full animate-ping"></div>
              <Wrench className="w-10 h-10 text-secondary animate-float" />
              <div className="w-3 h-3 bg-accent rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-orbitron font-bold mb-6">
              <span className="bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent">
                Outils Cybersécurité
              </span>
            </h1>
            
            <div className="relative max-w-3xl mx-auto">
              <p className="text-lg sm:text-xl text-muted-foreground px-4 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                Collection d'outils gratuits pour tester et améliorer votre sécurité
              </p>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {tools.map((tool, idx) => (
              <Card 
                key={tool.id} 
                className="cyber-border hover:cyber-glow transition-all duration-500 h-full flex flex-col bg-card/50 backdrop-blur-sm hover:scale-105 hover:-translate-y-1 group/card animate-fade-in"
                style={{ animationDelay: `${0.6 + (idx * 0.1)}s`, animationFillMode: 'both' }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(tool.category)} pulse-glow`}>
                      {getCategoryIcon(tool.category)}
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover/card:text-secondary transition-colors">{tool.name}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-1 hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transition-all duration-300">
                        {tool.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 group-hover/card:text-foreground transition-colors">{tool.description}</p>
                  {renderToolInterface(tool)}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tools;