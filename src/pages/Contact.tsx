import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, CheckCircle, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const Contact = () => {
  useDocumentTitle("Contact");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('secure-contact-form', {
        body: {
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          subject: formData.subject?.trim() || null,
          message: formData.message.trim(),
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de l\'envoi du message');
      }

      toast({
        title: "Message envoyé !",
        description: "Votre message a été envoyé avec succès. Je vous répondrai dans les plus brefs délais.",
      });

      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de l'envoi du message. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 cyber-grid opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5"></div>
      
      <div className="relative py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Enhanced Header */}
          <div className="text-center mb-12 sm:mb-16 animate-fade-in">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-3 h-3 bg-secondary rounded-full animate-ping"></div>
              <MessageSquare className="w-10 h-10 text-secondary animate-float" />
              <div className="w-3 h-3 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-orbitron font-bold mb-6">
              <span className="bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">
                Contact
              </span>
            </h1>
            
            <div className="relative max-w-3xl mx-auto">
              <p className="text-lg sm:text-xl text-muted-foreground px-4 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                Discutons de vos besoins en cybersécurité. Je suis là pour vous aider.
              </p>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent"></div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Contact Form */}
            <Card className="cyber-border card-interactive bg-card/50 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
              <CardHeader className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/0 via-secondary/5 to-secondary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <CardTitle className="relative flex items-center gap-2 text-lg sm:text-xl font-orbitron">
                  <Send className="w-5 h-5 text-secondary" />
                  Envoyez-moi un message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="animate-fade-in" style={{ animationDelay: '0.9s', animationFillMode: 'both' }}>
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-gradient-to-b from-secondary to-primary rounded-full"></div>
                        Nom complet *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Votre nom"
                        className="cyber-border mt-2 hover:border-secondary/50 transition-colors"
                      />
                    </div>
                    <div className="animate-fade-in" style={{ animationDelay: '1.1s', animationFillMode: 'both' }}>
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                        Email *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="votre@email.com"
                        className="cyber-border mt-2 hover:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="animate-fade-in" style={{ animationDelay: '1.3s', animationFillMode: 'both' }}>
                    <Label htmlFor="subject" className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-gradient-to-b from-accent to-secondary rounded-full"></div>
                      Sujet
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Objet de votre message"
                      className="cyber-border mt-2 hover:border-accent/50 transition-colors"
                    />
                  </div>
                  
                  <div className="animate-fade-in" style={{ animationDelay: '1.5s', animationFillMode: 'both' }}>
                    <Label htmlFor="message" className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="Décrivez votre projet ou vos besoins en cybersécurité..."
                      className="cyber-border mt-2 hover:border-primary/50 transition-colors"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full btn-cyber group animate-fade-in" 
                    style={{ animationDelay: '1.7s', animationFillMode: 'both' }}
                    disabled={loading}
                  >
                    {loading ? "Envoi en cours..." : "Envoyer le message"}
                    <Send className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6 sm:space-y-8">
              <Card className="cyber-border card-interactive bg-card/50 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '0.9s', animationFillMode: 'both' }}>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl font-orbitron">Informations de contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4 group cursor-default animate-fade-in" style={{ animationDelay: '1.2s', animationFillMode: 'both' }}>
                    <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/10 rounded-lg pulse-glow group-hover:scale-110 transition-transform duration-300">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">Email</h3>
                      <p className="text-muted-foreground text-base">rayane.jerbi@yahoo.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 group cursor-default animate-fade-in" style={{ animationDelay: '1.4s', animationFillMode: 'both' }}>
                    <div className="p-3 bg-gradient-to-br from-secondary/20 to-accent/10 rounded-lg pulse-glow group-hover:scale-110 transition-transform duration-300">
                      <Phone className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">Téléphone</h3>
                      <p className="text-muted-foreground text-base">+33 6 20 28 41 14</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 group cursor-default animate-fade-in" style={{ animationDelay: '1.6s', animationFillMode: 'both' }}>
                    <div className="p-3 bg-gradient-to-br from-accent/20 to-primary/10 rounded-lg pulse-glow group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">Localisation</h3>
                      <p className="text-muted-foreground text-base">Paris 15ᵉ, France</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cyber-border card-interactive bg-card/50 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '1.2s', animationFillMode: 'both' }}>
                <CardHeader>
                  <CardTitle className="font-orbitron">Disponibilité</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center animate-fade-in" style={{ animationDelay: '1.5s', animationFillMode: 'both' }}>
                      <span>Lundi - Vendredi</span>
                      <span className="text-muted-foreground font-medium">9h00 - 18h00</span>
                    </div>
                    <div className="flex justify-between items-center animate-fade-in" style={{ animationDelay: '1.7s', animationFillMode: 'both' }}>
                      <span>Samedi</span>
                      <span className="text-muted-foreground font-medium">10h00 - 16h00</span>
                    </div>
                    <div className="flex justify-between items-center animate-fade-in" style={{ animationDelay: '1.9s', animationFillMode: 'both' }}>
                      <span>Dimanche</span>
                      <span className="text-muted-foreground font-medium">Fermé</span>
                    </div>
                    <div className="mt-4 p-4 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-lg border border-green-500/20 animate-fade-in" style={{ animationDelay: '2.1s', animationFillMode: 'both' }}>
                      <div className="flex items-center gap-2 text-green-500">
                        <CheckCircle className="w-4 h-4 animate-pulse" />
                        <span className="text-sm font-medium">Réponse sous 24h garantie</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cyber-border card-interactive bg-card/50 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '1.5s', animationFillMode: 'both' }}>
                <CardHeader>
                  <CardTitle className="font-orbitron">Services disponibles</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    {[
                      'Audit de sécurité',
                      'Tests d\'intrusion',
                      'Formation cybersécurité',
                      'Consultation stratégique',
                      'Réponse aux incidents'
                    ].map((service, index) => (
                      <li 
                        key={index} 
                        className="flex items-center gap-2 animate-fade-in hover:translate-x-1 transition-transform duration-300"
                        style={{ animationDelay: `${1.8 + (index * 0.1)}s`, animationFillMode: 'both' }}
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{service}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
