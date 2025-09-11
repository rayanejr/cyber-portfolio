import { useState, useEffect } from "react";
import { Shield, Github, Linkedin, Mail, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Profile = {
  display_name?: string | null;
  role_title?: string | null;
  company?: string | null;
  degree?: string | null;
  school?: string | null;
  tagline?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  email_public?: string | null;
  resume_url?: string | null;
};

const SELECT_PROFILE =
  "display_name, role_title, company, degree, school, tagline, github_url, linkedin_url, email_public, resume_url" as const;

export function Footer() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchLogo = async () => {
      try {
        const { data, error } = await supabase
  .from("admin_files")
  .select("file_url")
  .eq("file_category", "icons")
  .eq("file_type", "logo")
  .eq("is_active", true); // pas de .single()

const first = data?.[0]?.file_url ?? null;
if (!error && first) setLogoUrl(first);


      } catch (error) {
        console.error("Error fetching logo:", error);
      }
    };

    const fetchProfile = async () => {
      try {
        // 1) tentative avec is_active
        let { data, error } = await supabase
          .from("admin_users") // <-- PLURIEL
          .select(SELECT_PROFILE)
          .eq("is_active", true)
          .returns<Profile[]>()        // <-- borne le type
          .limit(1);

        // 2) fallback avec is_activate si vide/erreur
        if ((!data || data.length === 0 || error) && mounted) {
          const fb = await supabase
            .from("admin_users")
            .select(SELECT_PROFILE)
            .eq("is_activate", true)
            .returns<Profile[]>();     // <-- borne le type
          data = fb.data;
          error = fb.error;
        }

        if (!error && data && data.length > 0 && mounted) {
          setProfile(data[0]);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    // séquentiel pour simplifier les types et debuggability
    fetchLogo().finally(fetchProfile);

    return () => {
      mounted = false;
    };
  }, []);

  // Fallbacks si BDD vide
  const displayName = profile?.display_name || "Rayane JERBI";
  const roleTitle = profile?.role_title || "Alternant Ingénieur Réseaux & Systèmes";
  const company = profile?.company || "LNE";
  const degree = profile?.degree || "M1 IRS";
  const school = profile?.school || "Université Paris-Saclay";
  const tagline = profile?.tagline || "Cybersécurité • DevOps • Réseaux";

  const github = profile?.github_url || "https://github.com/rayanejr";
  const linkedin = profile?.linkedin_url || "https://www.linkedin.com/in/rayane-jerbi";
  const email = profile?.email_public || "rayane.jerbi@yahoo.fr";
  const resumeUrl = profile?.resume_url || "";

  return (
    <footer className="cyber-border bg-card/50 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Logo + identité */}
          <div className="col-span-1 sm:col-span-2">
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo personnel"
                  className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
                />
              ) : (
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary cyber-glow" aria-hidden="true" />
              )}
              <span className="font-orbitron font-bold text-lg sm:text-xl cyber-text">
                {displayName}
              </span>
            </div>

            <p className="text-muted-foreground mb-2 sm:mb-2 max-w-xl text-sm sm:text-base">
              {roleTitle} <span className="text-muted-foreground/80">@ {company}</span> • {degree} – {school}
            </p>
            <p className="text-muted-foreground mb-3 sm:mb-4 max-w-xl text-sm sm:text-base">
              {tagline}
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {/* CV si dispo */}
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm sm:text-base px-3 py-1.5 rounded-xl border border-primary/40 hover:border-primary transition-colors"
                  aria-label="Télécharger mon CV (PDF)"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Télécharger mon CV
                </a>
              )}

              {/* Réseaux sociaux */}
              {github && (
                <a
                  href={github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="GitHub"
                  title="GitHub"
                >
                  <Github className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </a>
              )}
              {linkedin && (
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="LinkedIn"
                  title="LinkedIn"
                >
                  <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={`Envoyer un email à ${displayName}`}
                  title="Contact par email"
                >
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav aria-label="Navigation principale">
            <h3 className="font-orbitron font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Navigation</h3>
            <ul className="space-y-1 sm:space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">Accueil</Link></li>
              <li><Link to="/projects" className="text-muted-foreground hover:text-primary transition-colors text-sm">Projets</Link></li>
              <li><Link to="/veille" className="text-muted-foreground hover:text-primary transition-colors text-sm">Veille Cyber</Link></li>
              <li><Link to="/formation" className="text-muted-foreground hover:text-primary transition-colors text-sm">Formations</Link></li>
              <li><Link to="/experience" className="text-muted-foreground hover:text-primary transition-colors text-sm">Expériences</Link></li>
            </ul>
          </nav>

          {/* Services */}
          <div>
            <h3 className="font-orbitron font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Services</h3>
            <ul className="space-y-1 sm:space-y-2">
              <li><Link to="/tools" className="text-muted-foreground hover:text-primary transition-colors text-sm">Outils cyber</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
          <p className="text-muted-foreground text-xs sm:text-sm">
            © {new Date().getFullYear()} {displayName}. Tous droits réservés. |{" "}
            <span className="text-primary">Cybersécurité • DevOps • Réseaux</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
