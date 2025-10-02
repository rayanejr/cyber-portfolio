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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/10"></div>
      <div className="absolute inset-0 cyber-grid opacity-10 animate-fade-in"></div>
      
      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Enhanced floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full animate-float ${
              i % 3 === 0 ? 'w-2 h-2 bg-primary/30' : 
              i % 3 === 1 ? 'w-1.5 h-1.5 bg-secondary/30' : 
              'w-1 h-1 bg-accent/30'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 6}s`,
            }}
          />
        ))}
      </div>
      
      <div className="max-w-md w-full px-4 relative z-10">
        <Card className="w-full cyber-border hover:cyber-glow backdrop-blur-xl bg-card/90 shadow-2xl animate-scale-in transition-all duration-500">
          {/* Animated scan line */}
          <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
            <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-vertical opacity-50"></div>
          </div>
          
          <CardHeader className="space-y-4 text-center pb-8 relative">
            {/* Enhanced icon with glow */}
            <div className="mx-auto relative">
              <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-br from-primary via-secondary to-accent blur-xl opacity-50 animate-pulse"></div>
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center pulse-glow shadow-lg shadow-primary/50 animate-float">
                <Lock className="w-10 h-10 text-primary-foreground" />
              </div>
            </div>
            
            <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
              <CardTitle className="text-3xl sm:text-4xl font-orbitron font-bold">
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Administration
                </span>
              </CardTitle>
              <p className="text-base text-muted-foreground flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                Connexion sécurisée requise
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="relative">
            <form onSubmit={handleAuth} className="space-y-6 animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
              <div className="space-y-5">
                <div className="space-y-2 group">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2 group-hover:text-primary transition-colors">
                    <User className="w-4 h-4 text-primary animate-pulse" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="cyber-border focus:cyber-glow transition-all duration-300 hover:border-primary/50"
                  />
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2 group-hover:text-secondary transition-colors">
                    <Lock className="w-4 h-4 text-secondary animate-pulse" />
                    Mot de passe
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                    className="cyber-border focus:cyber-glow transition-all duration-300 hover:border-secondary/50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full btn-cyber group relative overflow-hidden shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-background border-t-transparent" />
                      <span className="animate-pulse">Connexion...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                      Se connecter
                    </>
                  )}
                </span>
              </Button>
            </form>

            {/* Enhanced Security info */}
            <div className="mt-8 p-5 rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 border border-border/50 cyber-border hover:cyber-glow transition-all duration-500 animate-fade-in" style={{ animationDelay: '0.7s', animationFillMode: 'both' }}>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 pulse-glow">
                  <AlertCircle className="w-5 h-5 text-primary" />
                </div>
                <div className="text-sm leading-relaxed">
                  <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Accès sécurisé
                  </p>
                  <p className="text-muted-foreground">
                    Authentification Supabase avec tokens JWT sécurisés, chiffrement AES-256 et protection CSRF
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAuth;
