import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code, Shield, Database, Network, Lock, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedSection from './AnimatedSection';

interface Skill {
  name: string;
  level: number;
  category: string;
  icon?: React.ReactNode;
}

interface SkillGroup {
  category: string;
  icon: React.ReactNode;
  color: string;
  items: Skill[];
}

interface SkillsSectionProps {
  skills: any[];
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ skills }) => {
  const [visibleSkills, setVisibleSkills] = useState<Set<string>>(new Set());

  // Transformer les données en format amélioré
  const enhancedSkills: SkillGroup[] = skills.map((skillGroup, index) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Sécurité': <Shield className="w-6 h-6" />,
      'Développement': <Code className="w-6 h-6" />,
      'Infrastructure': <Network className="w-6 h-6" />,
      'Base de données': <Database className="w-6 h-6" />,
      'Cryptographie': <Lock className="w-6 h-6" />,
      'Intelligence Artificielle': <Brain className="w-6 h-6" />
    };

    const colorMap: { [key: string]: string } = {
      'Sécurité': 'from-red-500 to-orange-500',
      'Développement': 'from-blue-500 to-cyan-500',
      'Infrastructure': 'from-green-500 to-emerald-500',
      'Base de données': 'from-purple-500 to-violet-500',
      'Cryptographie': 'from-yellow-500 to-amber-500',
      'Intelligence Artificielle': 'from-pink-500 to-rose-500'
    };

    return {
      category: skillGroup.category,
      icon: iconMap[skillGroup.category] || <Code className="w-6 h-6" />,
      color: colorMap[skillGroup.category] || 'from-primary to-secondary',
      items: skillGroup.items.map((item: string) => ({
        name: item,
        level: Math.floor(Math.random() * 30) + 70, // 70-100% pour simulation
        category: skillGroup.category,
        icon: iconMap[skillGroup.category]
      }))
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      enhancedSkills.forEach((group) => {
        group.items.forEach((skill) => {
          setVisibleSkills(prev => new Set([...prev, skill.name]));
        });
      });
    }, 200);

    return () => clearInterval(timer);
  }, [enhancedSkills]);

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 particles"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-6">
            Compétences <span className="cyber-text">Techniques</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Une expertise complète couvrant tous les aspects de la cybersécurité moderne,
            acquise à travers des projets concrets et une formation continue.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enhancedSkills.map((skillGroup, groupIndex) => (
            <AnimatedSection
              key={skillGroup.category}
              animation="scale-in"
              delay={groupIndex * 100}
              className="group"
            >
              <Card className="skill-card cyber-border h-full relative overflow-hidden">
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${skillGroup.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                {/* Animated border */}
                <div className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-primary via-secondary to-accent p-[1px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="bg-card rounded-lg w-full h-full"></div>
                </div>

                <CardHeader className="relative z-10 pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${skillGroup.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <div className="text-white">
                        {skillGroup.icon}
                      </div>
                    </div>
                    <div>
                      <span className="font-orbitron">{skillGroup.category}</span>
                      <div className="text-sm text-muted-foreground font-normal">
                        {skillGroup.items.length} compétences
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative z-10 space-y-4">
                  {skillGroup.items.map((skill, skillIndex) => (
                    <div
                      key={`${skillGroup.category}-${skill.name}-${skillIndex}`}
                      className={`group/skill ${visibleSkills.has(skill.name) ? 'animate-fade-in' : 'opacity-0'}`}
                      style={{ animationDelay: `${(groupIndex * 100) + (skillIndex * 50)}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="secondary" 
                          className="text-sm font-medium bg-muted/50 hover:bg-muted/80 transition-colors duration-200"
                        >
                          {skill.name}
                        </Badge>
                        <span className="text-sm text-primary font-mono font-bold">
                          Expert
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Stats footer simplifié */}
                  <div className="mt-6 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-center text-sm">
                      <Badge 
                        variant="outline" 
                        className="bg-primary/10 text-primary border-primary/20"
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        Maîtrise confirmée
                      </Badge>
                    </div>
                  </div>
                </CardContent>

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </Card>
            </AnimatedSection>
          ))}
        </div>

        {/* Enhanced CTA */}
        <AnimatedSection className="text-center mt-16" delay={800}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"></div>
            <Link to="/tools">
              <Button className="btn-cyber group hover-lift relative z-10 text-lg px-8 py-4">
                <Shield className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                Découvrir mes outils de cybersécurité
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
              </Button>
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default SkillsSection;