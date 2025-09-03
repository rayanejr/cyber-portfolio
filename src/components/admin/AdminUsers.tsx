import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Users, Shield, Key } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_super_admin: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

interface AdminUsersProps {
  currentUser: {
    id: string;
    full_name: string;
    is_super_admin: boolean;
  } | null;
}

const AdminUsers = ({ currentUser }: AdminUsersProps) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    password: "",
    is_super_admin: false,
    is_active: true
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });

  useEffect(() => {
    if (currentUser?.is_super_admin) {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs administrateurs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.is_super_admin) {
      toast({
        title: "Accès refusé",
        description: "Seuls les super administrateurs peuvent gérer les utilisateurs.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingUser) {
        // Mise à jour d'un utilisateur existant
        const { error } = await supabase
          .from('admin_users')
          .update({
            email: formData.email,
            full_name: formData.full_name,
            is_active: formData.is_active,
            is_super_admin: formData.is_super_admin
          })
          .eq('id', editingUser.id);

        if (error) throw error;
        
        toast({
          title: "Utilisateur modifié",
          description: "L'utilisateur a été modifié avec succès.",
        });
      } else {
        // Création d'un nouvel utilisateur
        const { data, error } = await supabase.rpc('create_admin_user', {
          p_email: formData.email,
          p_full_name: formData.full_name,
          p_password: formData.password,
          p_is_super_admin: formData.is_super_admin
        });

        if (error) throw error;
        
        toast({
          title: "Utilisateur créé",
          description: "L'utilisateur administrateur a été créé avec succès.",
        });
      }

      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error('Error saving admin user:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder l'utilisateur.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.rpc('change_own_password', {
        p_current_password: passwordData.current_password,
        p_new_password: passwordData.new_password
      });

      if (error) throw error;

      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été modifié avec succès.",
      });

      setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
      setIsPasswordDialogOpen(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier le mot de passe.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (user: AdminUser) => {
    if (!currentUser?.is_super_admin) {
      toast({
        title: "Accès refusé",
        description: "Seuls les super administrateurs peuvent modifier les utilisateurs.",
        variant: "destructive",
      });
      return;
    }

    setEditingUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name,
      password: "",
      is_super_admin: user.is_super_admin,
      is_active: user.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!currentUser?.is_super_admin) {
      toast({
        title: "Accès refusé",
        description: "Seuls les super administrateurs peuvent supprimer les utilisateurs.",
        variant: "destructive",
      });
      return;
    }

    if (id === currentUser.id) {
      toast({
        title: "Action impossible",
        description: "Vous ne pouvez pas supprimer votre propre compte.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès.",
      });
      
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting admin user:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'utilisateur.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      full_name: "",
      password: "",
      is_super_admin: false,
      is_active: true
    });
    setEditingUser(null);
    setIsDialogOpen(false);
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

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      {/* Section changement de mot de passe personnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Mon mot de passe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Key className="w-4 h-4 mr-2" />
                Changer mon mot de passe
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Changer mon mot de passe</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label htmlFor="current_password">Mot de passe actuel *</Label>
                  <Input
                    id="current_password"
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="new_password">Nouveau mot de passe *</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                    required
                    minLength={8}
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirm_password">Confirmer le nouveau mot de passe *</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                    required
                    minLength={8}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">Changer le mot de passe</Button>
                  <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                    Annuler
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Section gestion des utilisateurs (super admin uniquement) */}
      {currentUser.is_super_admin && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gestion des Utilisateurs ({users.length})
              </CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvel Utilisateur
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="full_name">Nom complet *</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        required
                      />
                    </div>

                    {!editingUser && (
                      <div>
                        <Label htmlFor="password">Mot de passe *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          required={!editingUser}
                          minLength={8}
                        />
                      </div>
                    )}

                    <div className="flex flex-col gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_active"
                          checked={formData.is_active}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                        />
                        <Label htmlFor="is_active">Compte actif</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_super_admin"
                          checked={formData.is_super_admin}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_super_admin: checked }))}
                        />
                        <Label htmlFor="is_super_admin">Super administrateur</Label>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit">
                        {editingUser ? 'Modifier' : 'Créer'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Annuler
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {users.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucun utilisateur pour le moment.
                </p>
              ) : (
                <div className="grid gap-4">
                  {users.map((user) => (
                    <Card key={user.id} className="transition-all duration-300 hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{user.full_name}</h3>
                              {user.is_super_admin && (
                                <Badge variant="default" className="flex items-center gap-1">
                                  <Shield className="w-3 h-3" />
                                  Super Admin
                                </Badge>
                              )}
                              {!user.is_active && (
                                <Badge variant="destructive">Inactif</Badge>
                              )}
                              {user.id === currentUser.id && (
                                <Badge variant="secondary">Vous</Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-1">
                              {user.email}
                            </p>
                            
                            <div className="text-xs text-muted-foreground">
                              {user.last_login_at ? (
                                `Dernière connexion: ${new Date(user.last_login_at).toLocaleDateString('fr-FR')}`
                              ) : (
                                'Jamais connecté'
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEdit(user)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {user.id !== currentUser.id && (
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDelete(user.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminUsers;