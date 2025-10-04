import { useState, useEffect } from "react";
import { Shield, Code, Award, Terminal, Briefcase, GraduationCap, FileText, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import profilePhoto from "@/assets/profile-photo.jpg";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import CVDownloadButton from "@/components/CVDownloadButton";

const Home = () => {
  useDocumentTitle("Accueil");
  const [typedText, setTypedText] = useState("");
  const fullText = "Expert en Cybersécurité";

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.substring(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 cyber-grid opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      
      {/* Hero Section */}
      <div className="relative container mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Text Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all duration-300 cursor-default">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-primary terminal-text">● System Online</span>
            </div>

            <div>
              <p className="text-primary/80 font-mono text-sm mb-2 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                &gt; whoami
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-orbitron font-bold mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
                <span className="block mb-2 gradient-text-animated">Rayane Jerbi</span>
                <span className="terminal-text typing-cursor text-3xl sm:text-4xl md:text-5xl">
                  {typedText}
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed animate-fade-in" style={{ animationDelay: '0.8s', animationFillMode: 'both' }}>
                <span className="text-primary/60 font-mono">&gt;</span> Spécialiste en sécurité offensive et défensive, SOC, et analyse de vulnérabilités. 
                Passionné par la protection des systèmes et la veille technologique.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '1.2s', animationFillMode: 'both' }}>
                <Button asChild size="lg" className="btn-cyber group relative overflow-hidden">
                  <Link to="/projects">
                    <span className="relative z-10">Voir mes projets</span>
                    <Shield className="ml-2 w-4 h-4 transition-transform group-hover:rotate-12 relative z-10" />
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="lg" className="cyber-border hover:bg-accent/10 hover:border-accent transition-all duration-300 group">
                  <Link to="/contact">
                    <span>Me contacter</span>
                    <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </Button>

                <CVDownloadButton />
              </div>
            </div>
          </div>

          {/* Profile Photo with Terminal Frame */}
          <div className="relative animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent rounded-full blur-3xl opacity-20 animate-pulse"></div>
            
            {/* Terminal Window */}
            <div className="relative bg-card/50 backdrop-blur-sm rounded-xl cyber-border overflow-hidden hover:cyber-glow transition-all duration-500 group">
              {/* Terminal Header */}
              <div className="bg-muted/50 px-4 py-3 flex items-center gap-2 border-b border-border/50">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <span className="text-xs font-mono text-muted-foreground ml-2">rayane@portfolio ~ %</span>
              </div>
              
              {/* Image Container */}
              <div className="p-4">
                <img
                  src={profilePhoto}
                  alt="Rayane Jerbi"
                  className="w-full rounded-lg shadow-2xl shadow-primary/20 transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
              
              {/* Status Bar */}
              <div className="bg-muted/50 px-4 py-2 border-t border-border/50 flex items-center justify-between">
                <span className="text-xs font-mono text-primary flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Ready
                </span>
                <span className="text-xs font-mono text-muted-foreground">profile.jpg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in hidden lg:block" style={{ animationDelay: '1.5s', animationFillMode: 'both' }}>
          <div className="flex flex-col items-center gap-2 cursor-pointer hover:text-primary transition-colors">
            <span className="text-xs font-mono text-muted-foreground">Scroll</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative bg-muted/30 py-12 sm:py-16 border-y border-border/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"></div>
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { label: "Projets", value: "15+", icon: Code },
              { label: "Certifications", value: "8+", icon: Award },
              { label: "Années d'expérience", value: "3+", icon: Briefcase },
              { label: "Technologies", value: "20+", icon: Terminal }
            ].map((stat, index) => (
              <div 
                key={index} 
                className="text-center p-6 rounded-lg bg-card/50 cyber-border hover:cyber-glow transition-all duration-500 group cursor-default animate-fade-in card-hover-effect hover:scale-105"
                style={{ animationDelay: `${0.9 + (index * 0.1)}s`, animationFillMode: 'both' }}
              >
                <div className="relative">
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
                  <div className="text-3xl font-bold font-orbitron mb-2 gradient-text-animated">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="relative py-12 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-12 animate-fade-in" style={{ animationDelay: '1.3s', animationFillMode: 'both' }}>
            <p className="text-primary/80 font-mono text-sm mb-2">&gt; ls -la ~/portfolio</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-orbitron font-bold gradient-text-animated">
              Explorer mon portfolio
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                title: "Formation",
                description: "Mon parcours académique et mes certifications professionnelles",
                icon: GraduationCap,
                link: "/formation",
                badge: "8+ Certifications",
                gradient: "from-primary/20 to-secondary/10",
                command: "cd formation/"
              },
              {
                title: "Expérience",
                description: "Mes expériences professionnelles en cybersécurité",
                icon: Briefcase,
                link: "/experience",
                badge: "3+ Années",
                gradient: "from-secondary/20 to-accent/10",
                command: "cd experience/"
              },
              {
                title: "Veille Techno",
                description: "Actualités et veille en cybersécurité",
                icon: FileText,
                link: "/veille",
                badge: "MAJ Quotidienne",
                gradient: "from-accent/20 to-primary/10",
                command: "cd veille/"
              }
            ].map((section, index) => (
              <Card 
                key={index}
                className="cyber-border hover:cyber-glow transition-all duration-500 group bg-card/50 backdrop-blur-sm hover:scale-105 hover:-translate-y-2 cursor-pointer animate-fade-in card-hover-effect"
                style={{ animationDelay: `${1.6 + (index * 0.15)}s`, animationFillMode: 'both' }}
              >
                <Link to={section.link} className="block">
                  <CardHeader className="relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${section.gradient} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    
                    <div className="flex items-start justify-between mb-4 relative">
                      <div className="p-3 bg-gradient-to-br from-primary/10 to-secondary/5 rounded-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 pulse-glow">
                        <section.icon className="w-6 h-6 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {section.badge}
                      </Badge>
                    </div>
                    
                    <p className="text-primary/60 font-mono text-xs mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      &gt; {section.command}
                    </p>
                    
                    <CardTitle className="text-xl font-orbitron group-hover:text-primary transition-colors">
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed group-hover:text-foreground transition-colors">
                      {section.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm font-mono">Explorer</span>
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
