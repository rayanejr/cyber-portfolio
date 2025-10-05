import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  useDocumentTitle("404 - Page non trouvée");
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 cyber-grid opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto cyber-border backdrop-blur-xl bg-card/90 shadow-2xl">
          <div className="p-8 sm:p-12 text-center space-y-6">
            {/* Icon */}
            <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center pulse-glow">
              <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-pulse" />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-6xl sm:text-7xl md:text-8xl font-orbitron font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                404
              </h1>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
                Page non trouvée
              </h2>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
            </p>

            {/* Path info */}
            <div className="p-3 sm:p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs sm:text-sm text-muted-foreground font-mono break-all">
                Chemin: <span className="text-foreground">{location.pathname}</span>
              </p>
            </div>

            {/* Button */}
            <Link to="/">
              <Button className="btn-cyber group shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 h-11 sm:h-12 px-6 sm:px-8">
                <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-2 transition-transform group-hover:scale-110" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
