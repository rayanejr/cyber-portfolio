import { useState, useEffect } from "react";
import { Menu, X, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const location = useLocation();

  const navigation = [
    { name: "Accueil", href: "/" },
    { name: "Projets", href: "/projects" },
    { name: "Veille Techno", href: "/veille" },
    { name: "Formation", href: "/formation" },
    { name: "Expérience", href: "/experience" },
    { name: "Outils", href: "/tools" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => location.pathname === href;

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
    <nav className="sticky top-0 z-50 cyber-border bg-card/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="h-6 w-6 sm:h-8 sm:w-8 object-contain" 
                />
              ) : (
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary cyber-glow" />
              )}
              <span className="font-orbitron font-bold text-lg sm:text-xl cyber-text">
                <span className="hidden sm:inline">JERBI Rayane</span>
                <span className="sm:hidden">JERBI R.</span>
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  isActive(item.href)
                    ? "text-primary bg-primary/10 border border-primary/30"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                <span className="hidden xl:inline">{item.name}</span>
                <span className="xl:hidden">{item.name.length > 8 ? item.name.slice(0, 8) + '...' : item.name}</span>
              </Link>
            ))}
            
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Link to="/admin">
                <Button variant="outline" size="sm" className="btn-ghost-cyber">
                  <User className="h-4 w-4 mr-2" />
                  <span>Admin</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="cyber-border"
            >
              {isOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile navigation */}
        {isOpen && (
          <div className="lg:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-sm sm:text-base font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? "text-primary bg-primary/10 border border-primary/30"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/admin"
                className="block px-3 py-2 rounded-md text-sm sm:text-base font-medium text-muted-foreground hover:text-primary hover:bg-primary/5"
                onClick={() => setIsOpen(false)}
              >
                <User className="h-4 w-4 mr-2 inline" />
                Interface Admin
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}