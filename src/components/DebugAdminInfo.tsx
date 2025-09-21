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
  const { toast } = useToast();

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

  const updatePassword = async () => {
    if (!newPassword || newPassword.length < 12) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 12 caractères",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été mis à jour avec succès",
      });
      setNewPassword('');
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
          <h3 className="font-semibold mb-2">Identifiants actuels :</h3>
          <div className="space-y-2">
            <div>
              <strong>Email :</strong> rayane.jerbi@yahoo.com
            </div>
            <div className="flex items-center gap-2">
              <strong>Mot de passe de test :</strong>
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
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Actions de dépannage :</h3>
          
          <Button 
            onClick={resetToDefaultPassword}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            Réinitialiser au mot de passe par défaut
          </Button>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Définir un nouveau mot de passe :</Label>
            <div className="flex gap-2">
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nouveau mot de passe (min. 12 caractères)"
                className="flex-1"
              />
              <Button 
                onClick={updatePassword}
                disabled={loading || !newPassword}
              >
                Mettre à jour
              </Button>
            </div>
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