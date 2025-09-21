import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Info } from 'lucide-react';

export const DebugAdminInfo = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const { toast } = useToast();

  const fetchAdminInfo = async () => {
    try {
      const { data: adminUsers } = await supabase
        .from('admin_users')
        .select('*')
        .in('email', ['rayane.jerbi@yahoo.com', 'admin@cybersecpro.com']);
      
      setAdminInfo(adminUsers);
    } catch (error) {
      console.error('Erreur fetch admin info:', error);
    }
  };

  React.useEffect(() => {
    fetchAdminInfo();
  }, []);

  const resetToDefaultPassword = async () => {
    setLoading(true);
    try {
      // Reset password to default for testing
      const { error } = await supabase.auth.updateUser({
        password: 'AdminCyber2024!'
      });

      if (error) throw error;

      toast({
        title: "Mot de passe réinitialisé",
        description: "Le mot de passe a été réinitialisé à 'AdminCyber2024!'",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createMissingAdmin = async () => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('create-admin', {
        body: {
          email: 'admin@cybersecpro.com',
          password: 'AdminCyberSec2024!@#',
          full_name: 'Super Administrateur'
        }
      });

      if (response.error) {
        console.error('Erreur création admin:', response.error);
        toast({
          title: "Erreur",
          description: `Impossible de créer l'admin: ${response.error.message}`,
          variant: "destructive"
        });
      } else {
        console.log('Admin créé:', response.data);
        toast({
          title: "Succès",
          description: "Utilisateur admin créé avec succès dans Supabase Auth!",
          variant: "default"
        });
        await fetchAdminInfo();
      }
    } catch (error: any) {
      console.error('Erreur lors de la création admin:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin`
      });

      if (error) {
        console.error('Erreur reset:', error);
        toast({
          title: "Erreur",
          description: `Impossible de reset: ${error.message}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Email envoyé",
          description: "Un email de réinitialisation a été envoyé!",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error('Erreur lors du reset:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors du reset",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          Informations de connexion Admin
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold mb-2">Identifiants de test :</h3>
          <div className="space-y-3">
            <div>
              <strong>Compte 1:</strong> rayane.jerbi@yahoo.com
              <div className="flex items-center gap-2 mt-1">
                <span className={showPassword ? '' : 'blur-sm select-none'}>
                  AdminCyber2024!
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div>
              <strong>Compte 2:</strong> admin@cybersecpro.com
              <div className="flex items-center gap-2 mt-1">
                <span className={showPassword ? '' : 'blur-sm select-none'}>
                  AdminCyberSec2024!@#
                </span>
              </div>
            </div>
          </div>
          
          {adminInfo && (
            <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
              <strong>État de la DB:</strong>
              <ul>
                {adminInfo.map((admin: any) => (
                  <li key={admin.id}>
                    {admin.email} - {admin.is_active ? '✅ Actif' : '❌ Inactif'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Actions de dépannage :</h3>
          
          <div className="grid grid-cols-1 gap-3">
            <Button 
              onClick={createMissingAdmin}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              Créer admin@cybersecpro.com dans Auth
            </Button>
            <Button 
              onClick={() => resetPassword('rayane.jerbi@yahoo.com')}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              Reset mot de passe Rayane
            </Button>
            <Button 
              onClick={() => resetPassword('admin@cybersecpro.com')}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              Reset mot de passe Admin
            </Button>
            <Button 
              onClick={fetchAdminInfo}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              Actualiser info admin
            </Button>
          </div>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Note :</strong> Ces outils sont uniquement pour le développement. 
            Supprimez ce composant en production !
          </p>
        </div>
      </CardContent>
    </Card>
  );
};