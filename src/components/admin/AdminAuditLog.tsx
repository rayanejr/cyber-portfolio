import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, Search, Shield, AlertTriangle, RefreshCw } from "lucide-react";

interface AuditLogEntry {
  id: string;
  admin_id: string | null;
  action: string;
  table_name: string | null;
  record_id: string | null;
  old_values: any;
  new_values: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  admin_users?: {
    full_name: string;
    email: string;
  } | null;
}

interface AdminAuditLogProps {
  currentUser: {
    id: string;
    full_name: string;
    is_super_admin: boolean;
  } | null;
}

const AdminAuditLog = ({ currentUser }: AdminAuditLogProps) => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser?.is_super_admin) {
      fetchAuditLogs();
    }
  }, [currentUser]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_audit_log')
        .select(`
          *,
          admin_users (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      setAuditLogs((data as AuditLogEntry[]) || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les logs d'audit.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELETE':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'INSERT':
        return '+';
      case 'UPDATE':
        return '✎';
      case 'DELETE':
        return '✕';
      default:
        return '?';
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.admin_users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.admin_users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.table_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = !selectedAction || log.action === selectedAction;
    
    return matchesSearch && matchesAction;
  });

  if (!currentUser?.is_super_admin) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Seuls les super administrateurs peuvent accéder aux logs d'audit.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement des logs d'audit...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Logs d'Audit ({filteredLogs.length})
            </CardTitle>
            <Button 
              onClick={fetchAuditLogs}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filtres */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <div>
              <Label htmlFor="search">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Rechercher par utilisateur, table ou action..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="action">Filtrer par action</Label>
              <select
                id="action"
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="">Toutes les actions</option>
                <option value="INSERT">Création</option>
                <option value="UPDATE">Modification</option>
                <option value="DELETE">Suppression</option>
              </select>
            </div>
          </div>

          {/* Liste des logs */}
          <div className="space-y-3">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <Eye className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm || selectedAction ? 'Aucun log ne correspond aux critères de recherche.' : 'Aucun log d\'audit pour le moment.'}
                </p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <Card key={log.id} className="transition-all duration-300 hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant="outline" 
                            className={`${getActionColor(log.action)} font-mono text-xs`}
                          >
                            {getActionIcon(log.action)} {log.action}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {log.table_name}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <p>
                            <strong>Utilisateur:</strong> {log.admin_users?.full_name || 'Système'} 
                            {log.admin_users?.email && ` (${log.admin_users.email})`}
                          </p>
                          <p>
                            <strong>Date:</strong> {new Date(log.created_at).toLocaleString('fr-FR')}
                          </p>
                          {log.record_id && (
                            <p>
                              <strong>ID Enregistrement:</strong> 
                              <code className="ml-1 px-1 py-0.5 bg-muted rounded text-xs">
                                {log.record_id}
                              </code>
                            </p>
                          )}
                          {log.ip_address && (
                            <p>
                              <strong>IP:</strong> {log.ip_address}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {(log.old_values || log.new_values) && (
                        <div className="text-xs bg-muted/50 p-3 rounded-md max-w-sm">
                          {log.old_values && (
                            <div className="mb-2">
                              <strong>Anciennes valeurs:</strong>
                              <pre className="mt-1 text-xs overflow-auto">
                                {JSON.stringify(log.old_values, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.new_values && (
                            <div>
                              <strong>Nouvelles valeurs:</strong>
                              <pre className="mt-1 text-xs overflow-auto">
                                {JSON.stringify(log.new_values, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuditLog;