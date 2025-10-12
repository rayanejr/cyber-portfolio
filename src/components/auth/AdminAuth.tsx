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
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <div className="absolute inset-0 cyber-grid opacity-10"></div>
      
      <div className="h-full w-full">
        <Card className="h-full w-full cyber-border backdrop-blur-xl bg-card/90 shadow-2xl rounded-none">
          {/* Desktop Layout */}
          <div className="hidden md:grid md:grid-cols-2 h-full">
            {/* Left side - Info */}
            <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-8 lg:p-12 flex flex-col justify-center border-r border-primary/20">
              <div className="space-y-6 lg:space-y-8 max-w-xl mx-auto w-full">
                <div className="space-y-4">
                  <h1 className="text-3xl lg:text-4xl xl:text-5xl font-orbitron font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Panneau d'Administration
                  </h1>
                  <p className="text-lg lg:text-xl text-muted-foreground">
                    Accès réservé uniquement aux administrateurs
                  </p>
                </div>

                <div className="space-y-3 md:space-y-4 text-sm md:text-base text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 animate-pulse"></div>
                    <p>Authentification Supabase avec tokens JWT</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 animate-pulse"></div>
                    <p>Chiffrement AES-256</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2 animate-pulse"></div>
                    <p>Protection CSRF</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="p-8 lg:p-12 flex items-center justify-center">
              <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg shadow-primary/50">
                    <Lock className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-orbitron font-bold">Connexion</h2>
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                  <div className="space-y-4 md:space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
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
                        className="cyber-border focus:cyber-glow h-11 md:h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                        <Lock className="w-4 h-4 text-secondary" />
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
                        className="cyber-border focus:cyber-glow h-11 md:h-12"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 md:h-12 btn-cyber group shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-background border-t-transparent" />
                          <span>Connexion...</span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-5 h-5 transition-transform group-hover:scale-110" />
                          Se connecter
                        </>
                      )}
                    </span>
                  </Button>
                </form>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden h-full flex flex-col p-4 overflow-y-auto">
            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-6">
              {/* Title */}
              <div className="text-center">
                <h1 className="text-xl font-orbitron font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Connexion Administration
                </h1>
              </div>

              {/* Form */}
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="email-mobile" className="text-xs font-medium">
                      Email
                    </Label>
                    <Input
                      id="email-mobile"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="cyber-border focus:cyber-glow h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password-mobile" className="text-xs font-medium">
                      Mot de passe
                    </Label>
                    <Input
                      id="password-mobile"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength={6}
                      className="cyber-border focus:cyber-glow h-10 text-sm"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 btn-cyber group shadow-lg shadow-primary/20 text-sm"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent" />
                        <span>Connexion...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 transition-transform group-hover:scale-110" />
                        Se connecter
                      </>
                    )}
                  </span>
                </Button>
              </form>

              {/* Info Card */}
              <Card className="cyber-border bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 backdrop-blur-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-2">
                    <h2 className="text-sm font-orbitron font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                      Panneau d'Administration
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Accès réservé uniquement aux administrateurs
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1 animate-pulse"></div>
                      <p>Authentification Supabase avec tokens JWT</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-1 animate-pulse"></div>
                      <p>Chiffrement AES-256</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1 animate-pulse"></div>
                      <p>Protection CSRF</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminAuth;
