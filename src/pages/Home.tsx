import { useState, useEffect } from "react";
import { ArrowRight, Shield, Target, Code, Award, ExternalLink, ChevronRight, Mail, Phone, MapPin } from "lucide-react";
import CVDownloadButton from "@/components/CVDownloadButton";
import AIAssistantSection from "@/components/AIAssistantSection";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/cyber-hero.jpg";
// import profilePhoto from "@/assets/profile-photo.jpg";
import projectSecurity from "@/assets/project-security.jpg";
import projectSoc from "@/assets/project-soc.jpg";
import projectThreat from "@/assets/project-threat.jpg";

type SkillGroup = { category: string; items: string[] };
type ProjectRow = {
  id: number | string;
  title: string;
  description: string;
  image_url?: string | null;
  technologies?: string[] | string | null;
  created_at?: string | null;
  slug?: string | null;
};
type CertRow = {
  id: string | number;
  name: string;
  issuer?: string;
  issue_date?: string;
  expiry_date?: string | null;
  pdf_url?: string | null;
  image_url?: string | null;
  credential_url?: string | null;
};

// Helper functions
const safeParseArray = (str: string): string[] => {
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const projectFallbacks = [projectSecurity, projectSoc, projectThreat];

export default function Home() {
  const [skills, setSkills] = useState<SkillGroup[]>([]);
  const [certifications, setCertifications] = useState<CertRow[]>([]);
  const [recentProjects, setRecentProjects] = useState<ProjectRow[]>([]);
  const { toast } = useToast();

  // Forcer le scroll en haut au montage du composant
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  // === Titres qui tournent (typewriter) ===
  const roles = [
    "Alternant Ingénieur Cloud & Sécurité",
    "Pentester Junior (Alternance)",
    "Alternant Ingénieur DevSecOps",
    "Analyste SOC / SIEM (Alternance)",
    "Alternant Ingénieur Systèmes & Réseaux",
    "Réponse à Incident – CSIRT (Alternance)",
    "Ingénieur Réseaux & Sécurité (Alternance)",
    "Ingénieur Sécurité Cloud (AWS/Azure) – Alternance",
  ];

  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = roles[roleIndex];
    const typingSpeed = isDeleting ? 40 : 80;
    const holdFull = 1200;
    const holdEmpty = 250;
    let t: number;

    if (!isDeleting && displayText === current) {
      t = window.setTimeout(() => setIsDeleting(true), holdFull);
    } else if (isDeleting && displayText === "") {
      t = window.setTimeout(() => {
        setIsDeleting(false);
        setRoleIndex((i) => (i + 1) % roles.length);
      }, holdEmpty);
    } else {
      t = window.setTimeout(() => {
        const nextLen = displayText.length + (isDeleting ? -1 : 1);
        setDisplayText(current.slice(0, nextLen));
      }, typingSpeed);
    }
    return () => window.clearTimeout(t);
  }, [displayText, isDeleting, roleIndex, roles]);

  // ===== Récupération du CV (sans colonnes fantômes) =====
  useEffect(() => {
    let mounted = true;

    const fetchResume = async () => {
      try {
        const { data, error } = await supabase
          .from("admin_files")
          .select("file_url,file_type,is_active")
          .eq("file_category", "cv");

        if (error) {
          console.warn("[CV] error:", error);
          setResumeUrl(null);
          return;
        }

        if (!mounted) return;

        const rows = (data ?? []).filter((r: any) => !!r?.file_url);

        // Priorité: PDF + actif > PDF > actif > le reste
        const score = (r: any) =>
          (/(^|\/)pdf$/i.test(r.file_type) || /\.pdf(\?|$)/i.test(r.file_url) ? 2 : 0) + (r.is_active ? 1 : 0);

        rows.sort((a: any, b: any) => score(b) - score(a));

        const chosen = rows[0];
        setResumeUrl(chosen?.file_url ?? null);
        console.log("[CV] choisi:", chosen);
      } catch (e) {
        console.error("Erreur chargement CV:", e);
        setResumeUrl(null);
      }
    };

    fetchResume();
    return () => {
      mounted = false;
    };
  }, []);

  // ===== Récupération de la photo de profil depuis admin_files (file_category='profile_photo') =====
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const { data, error } = await supabase
          .from("admin_files")
          .select("file_url, file_type, is_active, updated_at")
          .eq("file_category", "profile_photo");

        if (error || !data) {
          if (alive) setAvatarUrl(null);
          return;
        }

        // Filtre: actifs avec URL d'image valide
        const rows = data
          .filter((r: any) => r?.file_url)
          .filter((r: any) => /\.(jpg|jpeg|png|webp|gif)$/i.test(String(r.file_url)));

        if (rows.length === 0) {
          if (alive) setAvatarUrl(null);
          return;
        }

        // Prioriser: is_active puis updated_at le + récent
        rows.sort((a: any, b: any) => {
          const aScore = (a.is_active ? 10 : 0) + (a.updated_at ? new Date(a.updated_at).getTime() / 1e13 : 0);
          const bScore = (b.is_active ? 10 : 0) + (b.updated_at ? new Date(b.updated_at).getTime() / 1e13 : 0);
          return bScore - aScore;
        });

        const chosen = rows[0];
        if (alive) setAvatarUrl(String(chosen.file_url));
      } catch (e) {
        console.error("[profile_photo] fetch error:", e);
        if (alive) setAvatarUrl(null);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // fallback images si l’enregistrement n’a pas d’image
  const projectFallbacks = [projectSecurity, projectSoc, projectThreat];

  useEffect(() => {
    (async () => {
      try {
        // === Skills (TOUTES les compétences) ===
        const { data: skillsData, error: skillsErr } = await supabase
          .from("skills")
          .select("*")
          .order("category", { ascending: true });

        if (skillsErr) throw skillsErr;

        const grouped: SkillGroup[] =
          (skillsData || []).reduce((acc: SkillGroup[], s: any) => {
            const g = acc.find((x) => x.category === s.category);
            if (g) g.items.push(s.name);
            else acc.push({ category: s.category, items: [s.name] });
            return acc;
          }, []) || [];

        setSkills(grouped);

        // === Certifications ===
        const { data: certsData, error: certErr } = await supabase
          .from("certifications")
          .select("*")
          .eq("is_active", true)
          .order("issue_date", { ascending: false })
          .limit(8);

        if (certErr) throw certErr;
        setCertifications(certsData || []);

        // === Projets récents (3 max) ===
        const { data: projData, error: projErr } = await supabase
          .from("projects")
          .select("*")
          .eq("is_active", true)
          .order("featured", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(3);

        if (projErr) throw projErr;

        const normalized: ProjectRow[] = (projData ?? []).map((p: any, i: number) => ({
          ...p,
          technologies: Array.isArray(p.technologies)
            ? p.technologies
            : typeof p.technologies === "string"
              ? safeParseArray(p.technologies)
              : [],
          image_url: p.image_url || projectFallbacks[i % projectFallbacks.length],
        }));

        setRecentProjects(normalized);

        if ((projData ?? []).length === 0) {
          console.warn("[projects] 0 lignes renvoyées. Causes probables : RLS ou filtres trop stricts.");
        }
      } catch (e) {
        console.error(e);
        toast({
          title: "Chargement impossible",
          description: "Un problème est survenu lors de la récupération des données.",
          variant: "destructive",
        });
      }
    })();
  }, []);

  function safeParseArray(raw: string): string[] {
    try {
      const j = JSON.parse(raw);
      if (Array.isArray(j)) return j.map(String);
    } catch {}
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function isAllowedAsset(url?: string | null) {
    if (!url) return false;
    const u = url.split("?")[0].toLowerCase();
    return (
      u.endsWith(".pdf") ||
      u.endsWith(".jpg") ||
      u.endsWith(".jpeg") ||
      u.endsWith(".png") ||
      u.endsWith(".webp") ||
      u.endsWith(".gif")
    );
  }

  function viewCertification(cert: CertRow) {
    if (cert.pdf_url) {
      window.open(cert.pdf_url, "_blank");
    } else if (cert.image_url) {
      window.open(cert.image_url, "_blank");
    } else if (cert.credential_url) {
      window.open(cert.credential_url, "_blank");
    } else {
      toast({
        title: "Aucun fichier",
        description: "Aucun document ou lien n'est disponible pour cette certification",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 cyber-grid opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-accent/5"></div>

      {/* ===== HERO ===== */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-5 animate-scale-in"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Titre rotatif typewriter + dégradé violet */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-orbitron font-bold mb-4 sm:mb-6 animate-fade-in">
            <span className="sr-only">Rôle : </span>
            <span className="cyber-text">—</span>
            <div aria-live="polite" className="flex flex-wrap justify-center items-center gap-x-2">
              <span
                className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent animate-fade-in"
                style={{ animationDelay: "0.3s", animationFillMode: "both" }}
              >
                {displayText || "\u00A0"}
              </span>
              <span className="inline-block w-[2px] h-[1em] align-[-0.15em] bg-fuchsia-400 ml-1 animate-pulse" />
            </div>
          </h1>
          <p
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto px-4 animate-fade-in"
            style={{ animationDelay: "0.6s", animationFillMode: "both" }}
          >
            Étudiant en 2ᵉ année de Master IRS (Université Paris-Saclay, 2024–2026). Recherche une alternance (3
            semaines entreprise / 1 semaine école) pour développer mes compétences en cybersécurité et DevSecOps.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 animate-fade-in"
            style={{ animationDelay: "0.9s", animationFillMode: "both" }}
          >
            <Link
              to="/projects"
              className="animate-scale-in"
              style={{ animationDelay: "1.2s", animationFillMode: "both" }}
            >
              <Button size="lg" className="btn-cyber group w-full sm:w-auto">
                Découvrir mes projets
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <div className="animate-scale-in" style={{ animationDelay: "1.4s", animationFillMode: "both" }}>
              <CVDownloadButton />
            </div>
            <Link
              to="/contact"
              className="animate-scale-in"
              style={{ animationDelay: "1.6s", animationFillMode: "both" }}
            >
              <Button variant="outline" size="lg" className="btn-ghost-cyber w-full sm:w-auto">
                Me contacter
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== À PROPOS ===== */}
      <section className="py-12 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-3 h-3 bg-accent rounded-full animate-ping"></div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-orbitron font-bold">
                <span className="bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent">
                  À propos
                </span>
              </h2>
              <div className="w-3 h-3 bg-primary rounded-full animate-ping" style={{ animationDelay: "0.5s" }}></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] xl:grid-cols-[320px_1fr] gap-8 lg:gap-10 items-start">
            {/* Colonne gauche : portrait */}
            <div
              className="space-y-6 flex justify-center lg:justify-start animate-slide-in-right"
              style={{ animationDelay: "0.3s", animationFillMode: "both" }}
            >
              <div className="relative w-full max-w-sm lg:max-w-none">
                <AspectRatio ratio={3 / 4} className="rounded-xl overflow-hidden">
                  <img
                    src={avatarUrl ?? "/placeholder-avatar.png"}
                    alt="Rayane – cybersécurité"
                    className="w-full h-full object-cover object-[50%_20%] cyber-border hover:cyber-glow transition animate-scale-in"
                    style={{ animationDelay: "0.6s", animationFillMode: "both" }}
                  />
                </AspectRatio>

                <div
                  className="absolute -bottom-3 -right-3 bg-primary text-primary-foreground rounded-full p-2 animate-scale-in pulse-glow"
                  style={{ animationDelay: "0.9s", animationFillMode: "both" }}
                >
                  <Shield className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Colonne droite : pitch + 3 piliers */}
            <div className="space-y-8">
              <Card
                className="cyber-border hover:cyber-glow transition-all duration-500 bg-card/50 backdrop-blur-sm animate-fade-in"
                style={{ animationDelay: "0.6s", animationFillMode: "both" }}
              >
                <CardContent className="p-6">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Étudiant en Master IRS spécialité Cybersécurité, orienté DevSecOps et sécurité des infrastructures.
                    Compétences en CI/CD (GitLab, Jenkins), Cloud et IaC (AWS, Terraform) et automatisation (Python,
                    Bash, PowerShell) pour améliorer la sécurité et la fiabilité.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Badge className="bg-green-600 text-white border-0">Master IRS Cyber 2024–2026</Badge>
                    <Badge className="bg-green-600 text-white border-0">Alternance 3s/1s</Badge>
                    <Badge className="bg-green-600 text-white border-0">DevSecOps • CI/CD • Jenkins</Badge>
                    <Badge className="bg-green-600 text-white border-0">Cybersécurité • Pentest • Audit</Badge>
                    <Badge className="bg-green-600 text-white border-0">Cloud • AWS • Terraform</Badge>
                    <Badge className="bg-green-600 text-white border-0">
                      Automatisation • Python • Bash • PowerShell
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card
                  className="cyber-border card-interactive bg-card/50 backdrop-blur-sm animate-fade-in"
                  style={{ animationDelay: "0.9s", animationFillMode: "both" }}
                >
                  <CardHeader className="p-4 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-2 relative z-10" />
                    <CardTitle className="text-sm sm:text-base relative z-10">Cybersécurité</CardTitle>
                    <CardDescription className="text-xs sm:text-sm relative z-10">
                      Pentest, audit, durcissement
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card
                  className="cyber-border card-interactive bg-card/50 backdrop-blur-sm animate-fade-in"
                  style={{ animationDelay: "1.1s", animationFillMode: "both" }}
                >
                  <CardHeader className="p-4 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Target className="h-6 w-6 sm:h-8 sm:w-8 text-secondary mb-2 relative z-10" />
                    <CardTitle className="text-sm sm:text-base relative z-10">Systèmes & Réseaux</CardTitle>
                    <CardDescription className="text-xs sm:text-sm relative z-10">
                      VMware, AD, DNS, GPO, firewall
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card
                  className="cyber-border card-interactive bg-card/50 backdrop-blur-sm sm:col-span-2 lg:col-span-1 animate-fade-in"
                  style={{ animationDelay: "1.3s", animationFillMode: "both" }}
                >
                  <CardHeader className="p-4 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Code className="h-6 w-6 sm:h-8 sm:w-8 text-accent mb-2 relative z-10" />
                    <CardTitle className="text-sm sm:text-base relative z-10">DevOps & Cloud</CardTitle>
                    <CardDescription className="text-xs sm:text-sm relative z-10">
                      CI/CD, GitLab, Jenkins, AWS, Terraform
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ARSENAL TECHNIQUE CYBERSÉCURITÉ ===== */}
      <section className="py-20 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Enhanced header */}
          <div className="text-center mb-20 animate-fade-in">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-3 h-3 bg-primary rounded-full animate-ping"></div>
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{ animationDelay: "0.5s" }}></div>
              <Shield className="w-8 h-8 text-primary animate-float" />
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-ping" style={{ animationDelay: "1.5s" }}></div>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-orbitron font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Arsenal Technique
              </span>
            </h2>

            <div className="relative max-w-3xl mx-auto">
              <p className="text-xl text-muted-foreground leading-relaxed">
                Expertise en cybersécurité, DevSecOps et infrastructures sécurisées. De l'audit de sécurité au
                déploiement automatisé.
              </p>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            </div>
          </div>

          {/* Interactive skills matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skills.map((skillGroup, index) => (
              <div
                key={skillGroup.category}
                className="group relative"
                style={{
                  animationDelay: `${0.4 + index * 0.2}s`,
                  animationFillMode: "both",
                }}
              >
                {/* Main skill card */}
                <Card className="relative cyber-border hover:cyber-glow transition-all duration-700 group cursor-pointer overflow-hidden h-[450px] transform hover:scale-105 hover:-rotate-1 animate-fade-in flex flex-col">
                  {/* Animated background layers */}
                  <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                  {/* Scanning lines */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan opacity-0 group-hover:opacity-100"></div>
                  </div>

                  {/* Corner indicators */}
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary/30 group-hover:border-primary transition-colors duration-300"></div>
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-secondary/30 group-hover:border-secondary transition-colors duration-300"></div>
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-accent/30 group-hover:border-accent transition-colors duration-300"></div>
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary/30 group-hover:border-primary transition-colors duration-300"></div>

                  <CardHeader className="relative z-10 text-center pb-4 flex-shrink-0">
                    {/* Category icon */}
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                      <Shield className="w-8 h-8 text-primary group-hover:animate-pulse" />
                    </div>

                    <CardTitle className="text-xl font-orbitron font-bold text-foreground group-hover:text-primary transition-colors duration-300 mb-2 h-[60px] flex items-center justify-center">
                      {skillGroup.category}
                    </CardTitle>

                    {/* Progress indicator */}
                    <div className="flex justify-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-1 rounded-full transition-all duration-300 ${
                            i < Math.min(skillGroup.items.length, 5) ? "bg-primary" : "bg-muted"
                          }`}
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                  </CardHeader>

                  <CardContent className="relative z-10 flex-1 flex flex-col">
                    {/* Skills container avec hauteur fixe */}
                    <div className="flex-1 overflow-hidden space-y-2">
                      {skillGroup.items.slice(0, 8).map((skill: string, skillIndex: number) => (
                        <div
                          key={`${skillGroup.category}-${skill}-${skillIndex}`}
                          className="group/skill relative"
                          style={{
                            animationDelay: `${index * 0.2 + skillIndex * 0.1}s`,
                          }}
                        >
                          <div className="relative p-2 rounded-lg bg-gradient-to-r from-muted/20 to-muted/10 border border-muted/20 hover:border-primary/40 transition-all duration-300 group-hover/skill:transform group-hover/skill:scale-105 animate-fade-in">
                            {/* Skill name */}
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary/60 group-hover/skill:bg-primary group-hover/skill:animate-pulse flex-shrink-0"></div>
                              <span className="text-sm font-medium text-foreground group-hover/skill:text-primary transition-colors duration-300 truncate">
                                {skill}
                              </span>
                              <div className="ml-auto opacity-0 group-hover/skill:opacity-100 transition-opacity duration-300 flex-shrink-0">
                                <Code className="w-3 h-3 text-primary" />
                              </div>
                            </div>

                            {/* Skill level bar */}
                            <div className="mt-1 h-0.5 bg-muted/40 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-primary to-secondary w-0 group-hover/skill:w-full transition-all duration-1000 rounded-full"></div>
                            </div>

                            {/* Hover effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-secondary/3 opacity-0 group-hover/skill:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                          </div>
                        </div>
                      ))}

                      {/* Indicateur s'il y a plus de compétences */}
                      {skillGroup.items.length > 8 && (
                        <div className="text-xs text-muted-foreground text-center pt-2 opacity-70">
                          +{skillGroup.items.length - 8} autres compétences
                        </div>
                      )}
                    </div>

                    {/* Enhanced stats footer */}
                    <div className="pt-3 mt-auto border-t border-muted/20 group-hover:border-primary/20 transition-colors duration-300 flex-shrink-0">
                      <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground group-hover:text-primary transition-colors duration-300">
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          <span className="font-medium">{skillGroup.items.length}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
                        <div className="flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          <span>Expert</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Call to action */}
          <div className="text-center mt-16 animate-fade-in">
            <p className="text-lg text-muted-foreground mb-6">
              Découvrez mes projets pratiques et réalisations techniques
            </p>
            <Link to="/projects">
              <Button size="lg" className="btn-cyber group">
                Voir mes projets
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== PROJETS RÉCENTS (DB) ===== */}
      <section className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold">
              Projets <span className="cyber-text">récents</span>
            </h2>
            <Link to="/projects">
              <Button variant="outline" className="btn-ghost-cyber">
                Tous les projets
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {recentProjects.length === 0 ? (
              <Card className="cyber-border col-span-full text-center">
                <CardContent className="p-10">
                  <p className="text-muted-foreground">Aucun projet récent pour le moment.</p>
                </CardContent>
              </Card>
            ) : (
              recentProjects.map((p, idx) => {
                const imgSrc = String(p.image_url || projectFallbacks[idx % projectFallbacks.length]);
                const techs = Array.isArray(p.technologies)
                  ? p.technologies
                  : typeof p.technologies === "string"
                    ? safeParseArray(p.technologies)
                    : [];
                const year = p.created_at ? new Date(p.created_at).getFullYear() : null;

                return (
                  <Card key={p.id} className="cyber-border hover:cyber-glow transition overflow-hidden">
                    {/* Image */}
                    <div className="relative h-48">
                      <img
                        src={imgSrc}
                        alt={p.title || "Projet"}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {year && <Badge className="absolute top-4 right-4 bg-primary/90">{year}</Badge>}
                    </div>

                    {/* Titre + description */}
                    <CardHeader>
                      <CardTitle className="text-lg">{p.title}</CardTitle>
                      <CardDescription className="line-clamp-3">{p.description}</CardDescription>
                    </CardHeader>

                    {/* Meta + actions */}
                    <CardContent>
                      {/* Technologies (sécurisé) */}
                      {techs.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {techs.map((t: string) => (
                            <Badge key={t} variant="secondary" className="text-xs">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <Link to={`/projects/${p.slug ?? p.id}`}>
                        <Button size="sm" className="btn-cyber w-full" aria-label={`Voir le projet ${p.title}`}>
                          Voir plus
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ===== CERTIFICATIONS (PDF/JPG seulement) ===== */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold">
              <span className="cyber-text">Certifications</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Sécurité du Cloud (DataScientest, 03/2024) • Bash & Linux (01/2024) • Introduction à Python (01/2024) •
              Prévention Sup’ (INRS, 02/2024)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {certifications.map((cert) => {
              const canView = isAllowedAsset(cert.pdf_url) || isAllowedAsset(cert.image_url);
              return (
                <Card key={cert.id} className="cyber-border hover:cyber-glow transition">
                  <CardContent className="p-6 text-center">
                    <Award className="h-12 w-12 text-secondary mx-auto mb-4" />
                    <h3 className="font-orbitron font-bold text-lg mb-1">{cert.name}</h3>
                    <p className="text-muted-foreground text-sm mb-2">{cert.issuer}</p>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      {cert.issue_date && <Badge className="text-xs">{new Date(cert.issue_date).getFullYear()}</Badge>}
                      {cert.expiry_date && (
                        <Badge variant="outline" className="text-xs">
                          Expire {new Date(cert.expiry_date).getFullYear()}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => canView && viewCertification(cert)}
                        className="btn-cyber flex-1"
                        disabled={!canView}
                        title={canView ? "Voir la certification" : "Aucun document disponible"}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Voir certification
                      </Button>

                      {cert.credential_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(cert.credential_url!, "_blank")}
                          className="btn-ghost-cyber"
                          title="Page du certificateur"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== ASSISTANT IA ===== */}
      <AIAssistantSection />

      {/* ===== CONTACT ===== */}
      <section className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold">
              <span className="cyber-text">Contact</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Prêt à discuter de vos besoins en cybersécurité ou DevSecOps ?
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-10">
            <Card className="cyber-border hover:cyber-glow transition">
              <CardContent className="p-6 text-center">
                <Mail className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Email</h3>
                <p className="text-muted-foreground text-sm">rayane.jerbi@yahoo.com</p>
              </CardContent>
            </Card>

            <Card className="cyber-border hover:cyber-glow transition">
              <CardContent className="p-6 text-center">
                <Phone className="h-10 w-10 text-secondary mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Téléphone</h3>
                <p className="text-muted-foreground text-sm">+33 6 20 28 41 14</p>
              </CardContent>
            </Card>

            <Card className="cyber-border hover:cyber-glow transition">
              <CardContent className="p-6 text-center">
                <MapPin className="h-10 w-10 text-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Localisation</h3>
                <p className="text-muted-foreground text-sm">Paris 15ᵉ, France</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link to="/contact">
              <Button size="lg" className="btn-cyber group">
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M4 4h16v16H4z" stroke="currentColor" />
                </svg>
                Envoyer un message
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 bg-gradient-cyber">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4 text-primary-foreground">
            Prêt à sécuriser votre infrastructure ?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Discutons de vos objectifs et des priorités cyber.
          </p>
          <Link to="/contact">
            <Button size="lg" variant="secondary" className="btn-matrix">
              Démarrer un projet
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
