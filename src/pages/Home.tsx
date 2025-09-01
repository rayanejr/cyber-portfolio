import { useState, useEffect } from "react";
import {
  ArrowRight, Shield, Target, Code, Award, ExternalLink, ChevronRight,
  Mail, Phone, MapPin, FileText
} from "lucide-react";
import CVDownloadButton from "@/components/CVDownloadButton";
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


  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = roles[roleIndex];
    const typingSpeed = isDeleting ? 40 : 80; // vitesse lettre par lettre
    const holdFull = 1200;                    // pause quand le mot est complet
    const holdEmpty = 250;                    // pause quand effacé
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

        // === Certifications (actives, récentes d’abord) ===
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

      // Normalisation légère pour rester robuste côté rendu
      const normalized: ProjectRow[] = (projData ?? []).map((p, i) => ({
        ...p,
        technologies: Array.isArray(p.technologies)
          ? p.technologies
          : (typeof p.technologies === "string" ? safeParseArray(p.technologies) : []),
        image_url: p.image_url || projectFallbacks[i % projectFallbacks.length],
      }));

      setRecentProjects(normalized);


      // (optionnel) aide au debug dans la console
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

  // parse tolérant pour technologies
  function safeParseArray(raw: string): string[] {
    try {
      const j = JSON.parse(raw);
      if (Array.isArray(j)) return j.map(String);
    } catch {}
    return raw.split(",").map(s => s.trim()).filter(Boolean);
  }

  // n’autorise que PDF et JPG/JPEG
  function isAllowedAsset(url?: string | null) {
    if (!url) return false;
    const u = url.split("?")[0].toLowerCase();
    return u.endsWith(".pdf") || u.endsWith(".jpg") || u.endsWith(".jpeg");
  }

  function viewCertification(cert: CertRow) {
    const firstAllowed = [cert.pdf_url, cert.image_url].find(isAllowedAsset);
    if (firstAllowed) {
      window.open(firstAllowed!, "_blank");
      return;
    }
    toast({
      title: "Format non autorisé",
      description: "Seuls les fichiers PDF et JPG sont consultables.",
      variant: "destructive",
    });
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
          <h1 className="text-4xl md:text-6xl font-orbitron font-bold mb-6">
            <span className="sr-only">Rôle : </span>
            <span className="cyber-text">—</span>
            <span aria-live="polite" className="whitespace-nowrap">
              <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                {displayText || "\u00A0"}
              </span>
              <span className="inline-block w-[2px] h-[1em] align-[-0.15em] bg-fuchsia-400 ml-1 animate-pulse" />
            </span>{" "}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Sécurité offensive & défensive — je protège vos infrastructures contre les menaces modernes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/projects">
              <Button size="lg" className="btn-cyber group">
                Découvrir mes projets
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="btn-ghost-cyber">
                Me contacter
              </Button>
            </Link>
            <CVDownloadButton />
          </div>
        </div>
      </section>

      {/* ===== À PROPOS ===== */}
      <section className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-center mb-12">À propos</h2>

          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 items-start">
            {/* Colonne gauche : portrait */}
            <div className="space-y-6">
              <div className="relative">
                {/* <img
                  src={profilePhoto}
                  alt="Rayane – cybersécurité"
                  className="w-full h-[360px] object-cover rounded-xl cyber-border hover:cyber-glow transition"
                /> */}
                <AspectRatio ratio={3/4} className="rounded-xl overflow-hidden">
                  <img
                    src={profilePhoto}
                    alt="Rayane – cybersécurité"
                    className="w-full h-full object-cover object-[50%_20%] cyber-border hover:cyber-glow transition"
                  />
                </AspectRatio>

                <div className="absolute -bottom-3 -right-3 bg-primary text-primary-foreground rounded-full p-2">
                  <Shield className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Colonne droite : pitch + 3 piliers */}
            <div className="space-y-8">
              <Card className="cyber-border">
                <CardContent className="p-6">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Ingénieur sécurité avec une approche terrain + stratégie : mise en place de SOC,
                    détection & réponse, pentest avancé et outillage DevSecOps. J’aime transformer des
                    contraintes opérationnelles en systèmes fiables et mesurables.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Badge className="bg-green-600 text-white border-0">+2 ans d'expériences</Badge>
                    <Badge className="bg-green-600 text-white border-0">Disponibilité 24/7</Badge>
                    <Badge className="bg-green-600 text-white border-0">Pentest</Badge>
                    <Badge className="bg-green-600 text-white border-0">DevSecOps</Badge>
                    <Badge className="bg-green-600 text-white border-0">Automatisation</Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="cyber-border hover:cyber-glow transition">
                  <CardHeader>
                    <Shield className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-base">Sécurité défensive</CardTitle>
                    <CardDescription>SIEM, use-cases, réponse à incident</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="cyber-border hover:cyber-glow transition">
                  <CardHeader>
                    <Target className="h-8 w-8 text-secondary mb-2" />
                    <CardTitle className="text-base">Sécurité offensive</CardTitle>
                    <CardDescription>Pentest, red team, vulnérabilités</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="cyber-border hover:cyber-glow transition">
                  <CardHeader>
                    <Code className="h-8 w-8 text-accent mb-2" />
                    <CardTitle className="text-base">Dev sécurisé</CardTitle>
                    <CardDescription>Outils, CI/CD, bonnes pratiques</CardDescription>
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
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4">
              Compétences <span className="cyber-text">Techniques</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Une expertise complète couvrant tous les aspects de la cybersécurité moderne
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skills.map((skillGroup, index) => (
              <Card
                key={skillGroup.category}
                className={`cyber-border hover:cyber-glow transition-all duration-300 fade-in fade-in-delay-${index + 1} group relative overflow-hidden`}
              >
                {/* Glow effect background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <CardHeader className="relative z-10">
                  <CardTitle className="text-xl flex items-center gap-3 mb-4">
                    <div className="relative">
                      <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 w-4 h-4 bg-primary rounded-full animate-ping opacity-75"></div>
                    </div>
                    <span className="font-orbitron">{skillGroup.category}</span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative z-10">
                  <div className="space-y-3">
                    {skillGroup.items.map((skill: string, skillIndex: number) => (
                      <div
                        key={skill}
                        className={`flex items-center p-3 rounded-lg bg-card/50 hover:bg-card/80 transition-all duration-300 fade-in fade-in-delay-${skillIndex + 2}`}
                      >
                        {/* Badge VERT (pill) */}
                        <Badge className="text-sm font-medium bg-green-600 text-white border-0 rounded-full px-3 py-1">
                          {skill}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* trait fin + compteur */}
                  <div className="mt-6 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            <p className="text-lg text-muted-foreground">Consultation disponible en PDF ou JPG uniquement</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              Prêt à discuter de vos besoins en cybersécurité ?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
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
                <p className="text-muted-foreground text-sm">Paris, France</p>
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
    </div>
  );
}
