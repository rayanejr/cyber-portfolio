import { useState, useEffect } from "react";
import { Shield, Github, Linkedin, Twitter, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function Footer() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchLogo();
  }, []);

  const fetchLogo = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_files')
        .select('file_url')
        .eq('file_category', 'icons')
        .eq('file_type', 'logo')
        .eq('is_active', true)
        .single();

      if (!error && data) {
        setLogoUrl(data.file_url);
      }
    } catch (error) {
      console.error('Error fetching logo:', error);
    }
  };

  return (
    <footer className="cyber-border bg-card/50 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="h-8 w-8 object-contain" 
                />
              ) : (
                <Shield className="h-8 w-8 text-primary cyber-glow" />
              )}
              <span className="font-orbitron font-bold text-xl cyber-text">
                JERBI Rayane
              </span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Expert en cybersécurité passionné par la protection des infrastructures 
              numériques et la sensibilisation aux menaces cyber.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="mailto:rayane.jerbi@yahoo.fr" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-orbitron font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Accueil</Link></li>
              <li><Link to="/projects" className="text-muted-foreground hover:text-primary transition-colors">Projets</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
              <li><Link to="/formation" className="text-muted-foreground hover:text-primary transition-colors">Formation</Link></li>
              <li><Link to="/experience" className="text-muted-foreground hover:text-primary transition-colors">Expérience</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-orbitron font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><Link to="/tools" className="text-muted-foreground hover:text-primary transition-colors">Outils Gratuits</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Consultation</Link></li>
              <li><Link to="/admin" className="text-muted-foreground hover:text-primary transition-colors">Interface Admin</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            © 2025 JERBI Rayane. Tous droits réservés. | 
            <span className="text-primary"> Sécurité • Expertise • Innovation</span>
          </p>
        </div>
      </div>
    </footer>
  );
}