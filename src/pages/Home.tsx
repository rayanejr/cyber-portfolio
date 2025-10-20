import { useState, useEffect } from "react";
import { ArrowRight, Shield, Target, Code, Award, ExternalLink, ChevronRight, Mail, Phone, MapPin, Terminal, Copy, Download } from "lucide-react";
import CVDownloadButton from "@/components/CVDownloadButton";
import AIAssistantSection from "@/components/AIAssistantSection";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getProjectImageUrl } from "@/utils/imageLoader";
import heroImage from "@/assets/cyber-hero.jpg";
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
  const [selectedSkillIndex, setSelectedSkillIndex] = useState(0);
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
          image_url: p.image_url || null,
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
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Photo de profil"
                      className="w-full h-full object-cover cyber-border hover:cyber-glow transition animate-scale-in"
                      style={{ animationDelay: "0.6s", animationFillMode: "both" }}
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <p className="text-muted-foreground">Photo de profil</p>
                    </div>
                  )}
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

      {/* ===== COMPÉTENCES - STYLE API TERMINAL INTERACTIF ===== */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Title */}
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Compétences
            </h2>
            <Badge variant="outline" className="text-sm border-primary/40 bg-primary/5">
              <span className="text-primary font-mono">● system.skills</span>
              <span className="text-muted-foreground ml-2">status: active</span>
            </Badge>
          </div>

          {/* Terminal Window */}
          <div className="rounded-lg border-2 border-primary/30 bg-card/95 backdrop-blur-md overflow-hidden shadow-2xl animate-fade-in" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            {/* Terminal Header */}
            <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 px-4 py-3 border-b border-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-sm font-mono text-foreground">~/skills-api</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground font-mono hidden sm:inline">Server Status: Online</span>
                <Button variant="ghost" size="sm" className="text-xs font-mono h-6 px-2">[ Hide Endpoints ]</Button>
              </div>
            </div>

            {/* Main Content: Sidebar + Display */}
            <div className="grid md:grid-cols-[280px,1fr] min-h-[500px]">
              {/* Sidebar - Available Endpoints */}
              <div className="bg-muted/30 border-r border-primary/10 p-4">
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground font-mono mb-2">Available Endpoints</p>
                  <Badge variant="secondary" className="text-xs font-mono">{skills.length} routes</Badge>
                </div>
                
                <div className="space-y-2">
                  {skills.map((skillGroup, idx) => {
                    const isSelected = idx === selectedSkillIndex;
                    return (
                      <button
                        key={skillGroup.category}
                        onClick={() => setSelectedSkillIndex(idx)}
                        className={`w-full text-left p-3 rounded-md transition-all duration-200 flex items-center gap-2 ${
                          isSelected 
                            ? 'bg-primary/20 border border-primary/40' 
                            : 'hover:bg-muted/50 border border-transparent'
                        }`}
                      >
                        <Badge className={`font-mono text-xs px-1.5 ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-primary/40 text-primary'}`}>
                          GET
                        </Badge>
                        <span className="text-sm font-mono text-foreground truncate">
                          /{skillGroup.category.toLowerCase().replace(/\s+/g, '-')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Display Area - Selected category */}
              <div className="p-6">
                {skills[selectedSkillIndex] && (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary text-primary-foreground font-mono text-xs">GET</Badge>
                        <span className="text-lg font-mono text-foreground">/{skills[selectedSkillIndex].category.toLowerCase().replace(/\s+/g, '-')}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs h-7"
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(skills[selectedSkillIndex], null, 2));
                            toast({ title: "Copié !", description: "Données copiées dans le presse-papier" });
                          }}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs h-7">JSON</Button>
                        <Button variant="ghost" size="sm" className="text-xs h-7">
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>

                    {/* Response Body */}
                    <div className="rounded-md border border-primary/20 bg-muted/20 p-4 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-mono text-green-400 bg-green-500/10 px-2 py-1 rounded">Response Body</span>
                        <Badge variant="outline" className="text-xs font-mono border-green-500/40 text-green-400">200 OK</Badge>
                      </div>

                      {/* JSON Display */}
                      <div className="font-mono text-sm mb-4 p-3 bg-card/50 rounded border border-primary/10 overflow-x-auto">
                        <div className="text-foreground">
                          <span className="text-muted-foreground">{'{'}</span>
                          <br />
                          <span className="ml-4 text-secondary">"category"</span>
                          <span className="text-muted-foreground">: </span>
                          <span className="text-primary">"{skills[selectedSkillIndex].category}"</span>
                          <span className="text-muted-foreground">,</span>
                          <br />
                          <span className="ml-4 text-secondary">"skills"</span>
                          <span className="text-muted-foreground">: [</span>
                          <br />
                          {skills[selectedSkillIndex].items.map((skill, idx) => (
                            <span key={skill}>
                              <span className="ml-8 text-accent">"{skill}"</span>
                              {idx < skills[selectedSkillIndex].items.length - 1 && <span className="text-muted-foreground">,</span>}
                              <br />
                            </span>
                          ))}
                          <span className="ml-4 text-muted-foreground">]</span>
                          <br />
                          <span className="text-muted-foreground">{'}'}</span>
                        </div>
                      </div>

                      {/* Skills Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {skills[selectedSkillIndex].items.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="text-sm font-medium bg-primary/10 text-foreground hover:bg-primary/20 transition-all cursor-default border border-primary/20"
                          >
                            ● {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Footer Metadata */}
                    <div className="grid grid-cols-3 gap-4 p-4 rounded-md bg-muted/20 border border-primary/10">
                      <div>
                        <p className="text-xs text-muted-foreground font-mono mb-1">Response Time</p>
                        <p className="text-sm font-mono text-green-400">66ms <span className="text-xs text-muted-foreground">(normal)</span></p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-mono mb-1">Cache Status</p>
                        <p className="text-sm font-mono text-green-400">HIT</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-mono mb-1">Size</p>
                        <p className="text-sm font-mono text-green-400">{(JSON.stringify(skills[selectedSkillIndex]).length / 1024).toFixed(2)}KB</p>
                      </div>
                    </div>

                    {/* Bottom Info Bar */}
                    <div className="mt-4 pt-4 border-t border-primary/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-muted-foreground">
                      <span>API Version: 1.0.0</span>
                      <span>Last Updated: 19/10/2025</span>
                      <Button variant="link" className="text-xs h-auto p-0 text-primary hover:text-primary/80">View Docs</Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="text-center mt-10 animate-fade-in" style={{ animationDelay: "0.5s", animationFillMode: "both" }}>
            <Link to="/projects">
              <Button className="btn-cyber group px-8">
                Découvrir mes projets
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
                const imgSrc = p.image_url ? getProjectImageUrl(p.image_url) : projectFallbacks[idx % projectFallbacks.length];
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
            Toujours curieux d’en apprendre plus et de partager autour des bonnes pratiques de sécurité et
            d’automatisation.
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
