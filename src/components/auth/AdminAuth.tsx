import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Lock, User } from 'lucide-react';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface AdminAuthProps {
  onAuthenticated: (user: SupabaseUser) => void;
}

const AdminAuth: React.FC<AdminAuthProps> = ({ onAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Vérifier si c'est un admin
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', session.user.id)
          .eq('is_active', true)
          .maybeSingle();
        
        if (adminData) {
          onAuthenticated(session.user);
        }
      }
    };

    checkAuth();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Vérifier si c'est un admin
          const { data: adminData } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', session.user.id)
            .eq('is_active', true)
            .maybeSingle();
          
          if (adminData) {
            onAuthenticated(session.user);
          } else {
            toast({
              title: "Accès refusé",
              description: "Vous n'avez pas les permissions d'administrateur",
              variant: "destructive"
            });
            await supabase.auth.signOut();
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [onAuthenticated, toast]);

  // Helper function to validate password strength
  const validatePassword = (password: string): boolean => {
    const minLength = 12;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSymbol = /[^a-zA-Z0-9]/.test(password);
    
    return password.length >= minLength && hasUppercase && hasLowercase && hasDigit && hasSymbol;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate password strength for admin
      if (!validatePassword(password)) {
        toast({
          title: "Mot de passe invalide",
          description: "Le mot de passe doit contenir au moins 12 caractères avec majuscules, minuscules, chiffres et caractères spéciaux",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Check admin status
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', data.user.id)
          .eq('is_active', true)
          .maybeSingle();
        
        if (adminData) {
          onAuthenticated(data.user);
        } else {
          await supabase.auth.signOut();
          toast({
            title: "Accès refusé",
            description: "Vous n'avez pas les permissions d'administrateur",
            variant: "destructive"
          });
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "Erreur de connexion",
        description: error.message || "Une erreur s'est produite lors de la connexion",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4 animate-fade-in">
      <div className="max-w-md w-full">
        <Card className="cyber-border hover:cyber-glow transition-all duration-500 scale-in">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 pulse-glow">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-orbitron cyber-text">
              Administration Sécurisée
            </CardTitle>
            <p className="text-muted-foreground fade-in-delay-1">
              Authentification Supabase sécurisée
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="fade-in-delay-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              
              <div className="fade-in-delay-3">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                  required
                  minLength={12}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum 12 caractères avec majuscules, minuscules, chiffres et symboles
                </p>
              </div>

              <Button type="submit" className="w-full btn-cyber fade-in-delay-4" disabled={loading}>
                <User className="w-4 h-4 mr-2" />
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg fade-in-delay-5">
              <p className="text-sm text-muted-foreground text-center">
                <strong>Sécurité renforcée :</strong><br />
                Authentification via Supabase Auth avec tokens JWT sécurisés
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAuth;