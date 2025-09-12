import { useState, useEffect } from "react";
import {
  ArrowRight, Shield, Target, Code, Award, ExternalLink, ChevronRight,
  Mail, Phone, MapPin, FileText, Eye
} from "lucide-react";
import CVDownloadButton from "@/components/CVDownloadButton";
import CertificationViewer from "@/components/CertificationViewer";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/cyber-hero.jpg";
import profilePhoto from "@/assets/profile-photo.jpg";
import projectSecurity from "@/assets/project-security.jpg";
import projectSoc from "@/assets/project-soc.jpg";
import projectThreat from "@/assets/project-threat.jpg";

type SkillGroup = { category: string; items: string[] }
type ProjectRow = {
  id: number | string;
  title: string;
  description: string;
  image_url?: string | null;
  technologies?: string[] | string | null;
  created_at?: string | null;
  slug?: string | null;
}
type CertRow = {
  id: string | number;
  name: string;
  issuer?: string;
  issue_date?: string;
  expiry_date?: string | null;
  pdf_url?: string | null;
  image_url?: string | null;
  credential_url?: string | null;
}

export default function Home() {
  const [skills, setSkills] = useState<SkillGroup[]>([]);
  const [certifications, setCertifications] = useState<CertRow[]>([]);
  const [recentProjects, setRecentProjects] = useState<ProjectRow[]>([]);
  const { toast } = useToast();

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
      // On ne demande que des colonnes qui existent partout
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

      const rows = (data ?? []).filter(r => !!r?.file_url);

      // Priorité: PDF + actif > PDF > actif > le reste
      const score = (r: any) =>
        (/(^|\/)pdf$/i.test(r.file_type) || /\.pdf(\?|$)/i.test(r.file_url) ? 2 : 0) +
        (r.is_active ? 1 : 0);

      rows.sort((a, b) => score(b) - score(a));

      const chosen = rows[0];
      setResumeUrl(chosen?.file_url ?? null);
      console.log("[CV] choisi:", chosen);
    } catch (e) {
      console.error("Erreur chargement CV:", e);
      setResumeUrl(null);
    }
  };

  fetchResume();
  return () => { mounted = false; };
}, []);




  // fallback images si l’enregistrement n’a pas d’image
  const projectFallbacks = [projectSecurity, projectSoc, projectThreat];

  useEffect(() => {
    (async () => {
      try {
        // === Skills (groupés par catégorie, sans niveaux) ===
        const { data: skillsData, error: skillsErr } = await supabase
          .from("skills")
          .select("*")
          .eq("is_featured", true)
          .order("category", { ascending: true });

        if (skillsErr) throw skillsErr;

        const grouped: SkillGroup[] =
          (skillsData || []).reduce((acc: SkillGroup[], s: any) => {
            const g = acc.find(x => x.category === s.category);
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

        const normalized: ProjectRow[] = (projData ?? []).map((p, i) => ({
          ...p,
          technologies: Array.isArray(p.technologies)
            ? p.technologies
            : (typeof p.technologies === "string" ? safeParseArray(p.technologies) : []),
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
    return raw.split(",").map(s => s.trim()).filter(Boolean);
  }

  function isAllowedAsset(url?: string | null) {
    if (!url) return false;
    const u = url.split("?")[0].toLowerCase();
    return u.endsWith(".pdf") || u.endsWith(".jpg") || u.endsWith(".jpeg");
  }

  const [selectedCert, setSelectedCert] = useState<CertRow | null>(null);
  const [showCertViewer, setShowCertViewer] = useState(false);

  function viewCertification(cert: CertRow) {
    setSelectedCert(cert);
    setShowCertViewer(true);
  }

  return (
    <div className="min-h-screen">
      {/* ===== HERO ===== */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Titre rotatif typewriter + dégradé violet */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-orbitron font-bold mb-4 sm:mb-6 fade-in">
            <span className="sr-only">Rôle : </span>
            <span className="cyber-text">—</span>
            <div aria-live="polite" className="flex flex-wrap justify-center items-center gap-x-2">
              <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                {displayText || "\u00A0"}
              </span>
              <span className="inline-block w-[2px] h-[1em] align-[-0.15em] bg-fuchsia-400 ml-1 animate-pulse" />
            </div>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto px-4 fade-in fade-in-delay-1">
            Étudiant en 2ᵉ année de Master IRS (Université Paris-Saclay, 2024–2026). Recherche une alternance
            (3 semaines entreprise / 1 semaine école) pour développer mes compétences en cybersécurité et DevSecOps.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 fade-in fade-in-delay-2">
            <Link to="/projects">
              <Button size="lg" className="btn-cyber group w-full sm:w-auto">
                Découvrir mes projets
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <CVDownloadButton />
            <Link to="/contact">
              <Button variant="outline" size="lg" className="btn-ghost-cyber w-full sm:w-auto">
                Me contacter
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== À PROPOS ===== */}
      <section className="py-12 sm:py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-orbitron font-bold text-center mb-8 sm:mb-12 fade-in">À propos</h2>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] xl:grid-cols-[320px_1fr] gap-8 lg:gap-10 items-start">
            {/* Colonne gauche : portrait */}
            <div className="space-y-6 flex justify-center lg:justify-start slide-in-left">
              <div className="relative w-full max-w-sm lg:max-w-none">
                <AspectRatio ratio={3/4} className="rounded-xl overflow-hidden">
                  <img
                    src={profilePhoto}
                    alt="Rayane – cybersécurité"
                    className="w-full h-full object-cover object-[50%_20%] cyber-border hover:cyber-glow transition"
                  />
                </AspectRatio>

                <div className="absolute -bottom-3 -right-3 bg-primary text-primary-foreground rounded-full p-2 scale-in">
                  <Shield className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Colonne droite : pitch + 3 piliers */}
            <div className="space-y-8">
              <Card className="cyber-border">
                <CardContent className="p-6">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Étudiant en Master IRS spécialité Cybersécurité, orienté DevSecOps et sécurité des infrastructures. 
                    Compétences en CI/CD (GitLab, Jenkins), Cloud et IaC (AWS, Terraform) et 
                    automatisation (Python, Bash, PowerShell) pour améliorer la sécurité et la fiabilité.

                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Badge className="bg-green-600 text-white border-0">Master IRS Cyber 2024–2026</Badge>
                    <Badge className="bg-green-600 text-white border-0">Alternance 3s/1s</Badge>
                    <Badge className="bg-green-600 text-white border-0">DevSecOps • CI/CD • Jenkins</Badge>
                    <Badge className="bg-green-600 text-white border-0">Cybersécurité • Pentest • Audit</Badge>
                    <Badge className="bg-green-600 text-white border-0">Cloud • AWS • Terraform</Badge>
                    <Badge className="bg-green-600 text-white border-0">Automatisation • Python • Bash • PowerShell</Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="cyber-border hover:cyber-glow transition">
                  <CardHeader className="p-4">
                    <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-2" />
                    <CardTitle className="text-sm sm:text-base">Cybersécurité</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Pentest, audit, durcissement</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="cyber-border hover:cyber-glow transition">
                  <CardHeader className="p-4">
                    <Target className="h-6 w-6 sm:h-8 sm:w-8 text-secondary mb-2" />
                    <CardTitle className="text-sm sm:text-base">Systèmes & Réseaux</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">VMware, AD, DNS, GPO, firewall</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="cyber-border hover:cyber-glow transition sm:col-span-2 lg:col-span-1">
                  <CardHeader className="p-4">
                    <Code className="h-6 w-6 sm:h-8 sm:w-8 text-accent mb-2" />
                    <CardTitle className="text-sm sm:text-base">DevOps & Cloud</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">CI/CD, GitLab, Jenkins, AWS, Terraform</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COMPÉTENCES ===== */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
              <h2 className="text-3xl md:text-4xl font-orbitron font-bold">
                Compétences <span className="cyber-text">Techniques</span>
              </h2>
              <div className="w-4 h-4 bg-secondary rounded-full animate-pulse [animation-delay:500ms]"></div>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Réseaux & systèmes, cloud (AWS), IaC (Terraform), DevOps/CI-CD, scripting (Python/Bash/PowerShell).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {skills.map((skillGroup, index) => (
              <Card
                key={skillGroup.category}
                className={`cyber-border hover:cyber-glow transition-all duration-300 fade-in fade-in-delay-${index + 1} group relative overflow-hidden aspect-square`}
              >
                {/* Glow effect background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <CardHeader className="relative z-10 text-center">
                  <CardTitle className="text-xl font-orbitron mb-4">
                    {skillGroup.category}
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative z-10 h-full flex flex-col justify-between">
                  <div className="grid grid-cols-1 gap-2">
                    {skillGroup.items.map((skill: string, skillIndex: number) => (
                      <div
                        key={`${skillGroup.category}-${skill}-${skillIndex}`}
                        className="group relative"
                      >
                        <Badge className="text-sm font-medium bg-muted/80 text-foreground border border-border/50 hover:border-primary/50 transition-all duration-300 w-full justify-center py-2">
                          {skill}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* trait fin + compteur */}
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      <span>{skillGroup.items.length} compétences</span>
                    </div>
                  </div>
                </CardContent>

                {/* Animated border effect */}
                <div className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-primary via-secondary to-accent p-[2px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="bg-card rounded-lg w-full h-full"></div>
                </div>
              </Card>
            ))}
          </div>

          {/* Skills CTA */}
          <div className="text-center mt-12 fade-in fade-in-delay-4">
            <Link to="/tools">
              <Button className="btn-cyber group">
                Découvrir mes outils de cybersécurité
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
                const techs =
                  Array.isArray(p.technologies)
                    ? p.technologies
                    : (typeof p.technologies === "string" ? safeParseArray(p.technologies) : []);
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
                      {year && (
                        <Badge className="absolute top-4 right-4 bg-primary/90">
                          {year}
                        </Badge>
                      )}
                    </div>

                    {/* Titre + description */}
                    <CardHeader>
                      <CardTitle className="text-lg">{p.title}</CardTitle>
                      <CardDescription className="line-clamp-3">
                        {p.description}
                      </CardDescription>
                    </CardHeader>

                    {/* Meta + actions */}
                    <CardContent>
                      {/* Technologies (sécurisé) */}
                      {techs.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {techs.map((t) => (
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
              Sécurité du Cloud (DataScientest, 03/2024) • Bash & Linux (01/2024) • Introduction à Python (01/2024) • Prévention Sup’ (INRS, 02/2024)
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
                        onClick={() => viewCertification(cert)}
                        className="btn-matrix flex-1"
                        disabled={!canView}
                        title={canView ? "Ouvrir le document" : "PDF/JPG requis"}
                      >
                        Voir
                      </Button>

                      {(cert.pdf_url || cert.image_url) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewCertification(cert)}
                          className="btn-ghost-cyber"
                          title="Voir la certification"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
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
                <FileText className="mr-2 h-5 w-5" />
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

      {/* Certification Viewer Modal */}
      <CertificationViewer
        isOpen={showCertViewer}
        onClose={() => setShowCertViewer(false)}
        certification={selectedCert ? {
          name: selectedCert.name,
          issuer: selectedCert.issuer || '',
          issue_date: selectedCert.issue_date,
          expiry_date: selectedCert.expiry_date,
          pdf_url: selectedCert.pdf_url,
          image_url: selectedCert.image_url,
          credential_url: selectedCert.credential_url
        } : null}
      />
    </div>
  );
}
