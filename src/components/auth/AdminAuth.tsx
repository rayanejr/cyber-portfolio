import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Lock, User, Shield, KeyRound, AlertCircle } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AdminAuthProps {
  onAuthenticated: (user: SupabaseUser) => void;
}

const AdminAuth: React.FC<AdminAuthProps> = ({ onAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        onAuthenticated(session.user);
      }
    };

    checkAuth();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          onAuthenticated(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [onAuthenticated]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        onAuthenticated(data.user);
      }
    } catch (error: any) {
      const timestamp = new Intl.DateTimeFormat('fr-FR', {
        timeZone: 'Europe/Paris',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(new Date());
      
      console.error(`[Auth] ${timestamp} - Erreur de connexion:`, error);
      toast({
        title: "Erreur de connexion",
        description: "Identifiants invalides. Veuillez vérifier vos informations.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4 relative overflow-hidden">
      {/* Enhanced Background effects */}
      <div className="absolute inset-0 cyber-grid opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
      
      {/* Animated floating elements */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-primary rounded-full animate-ping"></div>
      <div className="absolute top-40 right-40 w-3 h-3 bg-secondary rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-accent rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
      
      <div className="max-w-md w-full relative z-10">
        <Card className="cyber-border hover:cyber-glow transition-all duration-700 animate-scale-in bg-card/80 backdrop-blur-md shadow-2xl shadow-primary/20">
          {/* Animated glow effect on card */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 rounded-lg animate-pulse"></div>
          
          <CardHeader className="text-center relative">
            {/* Animated icon container */}
            <div className="relative mx-auto w-20 h-20 mb-6 animate-fade-in">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center pulse-glow shadow-lg shadow-primary/50">
                <Lock className="h-10 w-10 text-primary-foreground animate-float" />
              </div>
              {/* Orbiting shields */}
              <Shield className="absolute -top-1 -right-1 h-6 w-6 text-secondary animate-pulse" style={{ animationDelay: '0.5s' }} />
              <KeyRound className="absolute -bottom-1 -left-1 h-6 w-6 text-accent animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            
            <CardTitle className="text-3xl font-orbitron mb-2 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Administration
              </span>
            </CardTitle>
            <p className="text-muted-foreground animate-fade-in flex items-center justify-center gap-2" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
              <Shield className="w-4 h-4" />
              Authentification Supabase sécurisée
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6 relative">
            <form onSubmit={handleAuth} className="space-y-5">
              <div className="animate-fade-in" style={{ animationDelay: '0.9s', animationFillMode: 'both' }}>
                <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-primary" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="cyber-border hover:border-primary/50 transition-all duration-300 focus:shadow-lg focus:shadow-primary/20"
                  required
                />
              </div>
              
              <div className="animate-fade-in" style={{ animationDelay: '1.2s', animationFillMode: 'both' }}>
                <Label htmlFor="password" className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-secondary" />
                  Mot de passe
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="cyber-border hover:border-secondary/50 transition-all duration-300 focus:shadow-lg focus:shadow-secondary/20"
                  required
                  minLength={6}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full btn-cyber animate-fade-in group relative overflow-hidden" 
                style={{ animationDelay: '1.5s', animationFillMode: 'both' }}
                disabled={loading}
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <User className="w-4 h-4 mr-2 relative z-10" />
                <span className="relative z-10">{loading ? 'Connexion...' : 'Se connecter'}</span>
              </Button>
            </form>

            {/* Enhanced security info box */}
            <div className="mt-6 p-5 bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg animate-fade-in backdrop-blur-sm border border-border/50" style={{ animationDelay: '1.8s', animationFillMode: 'both' }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 pulse-glow">
                  <AlertCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">Sécurité renforcée</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Authentification Supabase avec tokens JWT sécurisés, chiffrement AES-256 et protection CSRF
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative cyber lines */}
            <div className="absolute top-0 left-0 w-20 h-px bg-gradient-to-r from-transparent to-primary/50 animate-fade-in" style={{ animationDelay: '2s', animationFillMode: 'both' }}></div>
            <div className="absolute bottom-0 right-0 w-20 h-px bg-gradient-to-l from-transparent to-secondary/50 animate-fade-in" style={{ animationDelay: '2.2s', animationFillMode: 'both' }}></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAuth;
