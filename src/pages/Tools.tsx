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
import { Shield, Key, AlertTriangle, Users, Lock, Globe, Terminal, Wifi, Search, Bug, Code, Database, Activity } from "lucide-react";

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

  const simulateBurpSuite = (formData: any) => {
    // Simulation de Burp Suite
    const vulnerabilities = [
      'SQL Injection',
      'Cross-Site Scripting (XSS)',
      'Cross-Site Request Forgery (CSRF)',
      'Insecure Direct Object References',
      'Security Misconfiguration'
    ];
    
    const found = vulnerabilities.filter(() => Math.random() > 0.6);
    
    return {
      scanType: formData.scanType || 'Active Scan',
      target: formData.target || 'https://example.com',
      vulnerabilities: found,
      riskLevel: found.length > 2 ? 'High' : found.length > 0 ? 'Medium' : 'Low',
      scanDuration: Math.floor(Math.random() * 30) + 10 + ' minutes'
    };
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

  const simulateNmap = (formData: any) => {
    // Simulation de Nmap
    const commonPorts = [22, 80, 443, 21, 25, 53, 110, 143, 993, 995];
    const openPorts = commonPorts.filter(() => Math.random() > 0.7);
    
    return {
      target: formData.target || '192.168.1.1/24',
      scanType: formData.scanType || 'TCP SYN Scan',
      hostsUp: Math.floor(Math.random() * 10) + 1,
      openPorts: openPorts,
      services: openPorts.map(port => ({
        port,
        service: port === 80 ? 'http' : port === 443 ? 'https' : port === 22 ? 'ssh' : 'unknown',
        version: 'detected'
      })),
      osGuess: ['Linux 3.2 - 4.9', 'Windows 10', 'macOS'][Math.floor(Math.random() * 3)]
    };
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
      case 'Web Security':
      case 'web security':
        result = simulateBurpSuite(formData);
        break;
      case 'Penetration Testing':
      case 'penetration testing':
        result = simulateMetasploit(formData);
        break;
      case 'Network Security':
      case 'network security':
        result = simulateNmap(formData);
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
            {toolResults[tool.id] && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="font-semibold mb-2">Score: {toolResults[tool.id].score}/{toolResults[tool.id].total}</div>
                <div className="space-y-2">
                  {Object.entries(toolResults[tool.id].headers).map(([header, present]) => (
                    <div key={header} className="flex justify-between">
                      <span className="text-sm">{header}</span>
                      <span className={present ? 'text-green-400' : 'text-red-400'}>
                        {present ? '✅' : '❌'}
                      </span>
                    </div>
                  ))}
                </div>
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
            {toolResults[tool.id] && (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    toolResults[tool.id].grade === 'A+' ? 'text-green-400' : 
                    toolResults[tool.id].grade === 'A' ? 'text-green-400' : 
                    'text-yellow-400'
                  }`}>
                    Grade: {toolResults[tool.id].grade}
                  </div>
                </div>
                <div>
                  <div className="font-semibold">Protocoles supportés:</div>
                  <div className="text-sm">{toolResults[tool.id].protocols.join(', ')}</div>
                </div>
                <div>
                  <div className="font-semibold">Certificat:</div>
                  <div className="text-sm">Expire le: {toolResults[tool.id].certificate.expires}</div>
                </div>
                {toolResults[tool.id].vulnerabilities.length > 0 && (
                  <div>
                    <div className="font-semibold text-red-400">Vulnérabilités:</div>
                    <div className="text-sm">{toolResults[tool.id].vulnerabilities.join(', ')}</div>
                  </div>
                )}
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
          <Tabs defaultValue="scan" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scan">Scanner</TabsTrigger>
              <TabsTrigger value="proxy">Proxy</TabsTrigger>
            </TabsList>
            <TabsContent value="scan" className="space-y-4">
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
                  <Select name="scanType" defaultValue="Active Scan">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active Scan">Scan actif</SelectItem>
                      <SelectItem value="Passive Scan">Scan passif</SelectItem>
                      <SelectItem value="Crawl">Exploration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Lancer le scan</Button>
                {toolResults[tool.id] && (
                  <div className="p-4 bg-muted rounded-lg space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Cible:</strong> {toolResults[tool.id].target}</div>
                      <div><strong>Type:</strong> {toolResults[tool.id].scanType}</div>
                      <div><strong>Durée:</strong> {toolResults[tool.id].scanDuration}</div>
                      <div className={`font-semibold ${
                        toolResults[tool.id].riskLevel === 'High' ? 'text-red-400' :
                        toolResults[tool.id].riskLevel === 'Medium' ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>Risque: {toolResults[tool.id].riskLevel}</div>
                    </div>
                    {toolResults[tool.id].vulnerabilities.length > 0 && (
                      <div>
                        <div className="font-semibold text-red-400 mb-2">Vulnérabilités détectées:</div>
                        <ul className="text-sm space-y-1">
                          {toolResults[tool.id].vulnerabilities.map((vuln: string, idx: number) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="text-red-400">•</span>
                              {vuln}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </TabsContent>
            <TabsContent value="proxy" className="space-y-4">
              <div className="text-center text-muted-foreground">
                <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Interface proxy intercepteur</p>
                <p className="text-sm">Configuration requise pour intercepter le trafic HTTP/HTTPS</p>
              </div>
            </TabsContent>
          </Tabs>
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
              <Label htmlFor="target">Cible réseau</Label>
              <Input name="target" placeholder="192.168.1.0/24" required />
            </div>
            <div>
              <Label htmlFor="scanType">Type de scan</Label>
              <Select name="scanType" defaultValue="TCP SYN Scan">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TCP SYN Scan">TCP SYN Scan</SelectItem>
                  <SelectItem value="UDP Scan">UDP Scan</SelectItem>
                  <SelectItem value="Ping Scan">Ping Scan</SelectItem>
                  <SelectItem value="OS Detection">Détection OS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">Lancer le scan réseau</Button>
            {toolResults[tool.id] && (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Cible:</strong> {toolResults[tool.id].target}</div>
                  <div><strong>Type:</strong> {toolResults[tool.id].scanType}</div>
                  <div><strong>Hôtes actifs:</strong> {toolResults[tool.id].hostsUp}</div>
                  <div><strong>OS probable:</strong> {toolResults[tool.id].osGuess}</div>
                </div>
                {toolResults[tool.id].openPorts.length > 0 && (
                  <div>
                    <div className="font-semibold mb-2">Ports ouverts:</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {toolResults[tool.id].services.map((service: any, idx: number) => (
                        <div key={idx} className="flex justify-between">
                          <span>{service.port}/{service.service}</span>
                          <span className="text-green-400">{service.version}</span>
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
    <div className="min-h-screen bg-background py-12 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 cyber-text">
            Outils Cybersécurité
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Collection d'outils gratuits pour tester et améliorer votre sécurité
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {tools.map((tool) => (
            <Card key={tool.id} className="cyber-border hover:cyber-glow transition-all duration-300 h-full flex flex-col">
              <CardHeader className="pb-3">
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