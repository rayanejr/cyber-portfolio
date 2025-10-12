import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Mail, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminProfile = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [emailData, setEmailData] = useState({
    newEmail: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user?.email) {
        setEmailData({ newEmail: user.email });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les informations utilisateur.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailData.newEmail || !emailData.newEmail.includes('@')) {
      toast({
        title: "Email invalide",
        description: "Veuillez entrer un email valide.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        email: emailData.newEmail
      });

      if (error) throw error;

      toast({
        title: "Email mis à jour",
        description: "Vérifiez votre nouvelle adresse email pour confirmer le changement.",
      });

      fetchUser();
    } catch (error: any) {
      console.error('Error updating email:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour l'email.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Mot de passe trop court",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Les mots de passe ne correspondent pas",
        description: "Veuillez vérifier la confirmation du mot de passe.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès.",
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le mot de passe.",
        variant: "destructive",
      });
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Mon Profil
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="password">
              <Lock className="w-4 h-4 mr-2" />
              Mot de passe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Modifier l'adresse email</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateEmail} className="space-y-4">
                  <div>
                    <Label htmlFor="current-email">Email actuel</Label>
                    <Input
                      id="current-email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div>
                    <Label htmlFor="new-email">Nouvel email</Label>
                    <Input
                      id="new-email"
                      type="email"
                      value={emailData.newEmail}
                      onChange={(e) => setEmailData({ newEmail: e.target.value })}
                      placeholder="nouveau@email.com"
                      required
                    />
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex gap-2">
                      <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-900 dark:text-blue-100">
                        <p className="font-semibold mb-1">Important :</p>
                        <p>Vous recevrez un email de confirmation à votre nouvelle adresse. Vous devez cliquer sur le lien pour valider le changement.</p>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Mettre à jour l'email
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Modifier le mot de passe</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <Label htmlFor="new-password">Nouveau mot de passe</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Minimum 6 caractères"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Retapez le mot de passe"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <div className="flex gap-2">
                      <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-900 dark:text-amber-100">
                        <p className="font-semibold mb-1">Sécurité :</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Minimum 6 caractères</li>
                          <li>Utilisez un mot de passe unique</li>
                          <li>Mélangez lettres, chiffres et symboles</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    <Lock className="w-4 h-4 mr-2" />
                    Changer le mot de passe
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-6 bg-muted">
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>ID utilisateur :</strong> {user?.id}</p>
              <p><strong>Créé le :</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}</p>
              <p><strong>Dernière connexion :</strong> {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('fr-FR') : 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default AdminProfile;
