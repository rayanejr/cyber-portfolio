import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
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
      const { data, error } = await supabase.functions.invoke('contact-form', {
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
    <div className="min-h-screen bg-background py-12 sm:py-20 animate-fade-in">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16 fade-in-delay-1">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 cyber-text font-orbitron">
            Contact
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Discutons de vos besoins en cybersécurité. Je suis là pour vous aider.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Contact Form */}
          <Card className="cyber-border hover:cyber-glow transition-all duration-500 fade-in-delay-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-orbitron">
                <Send className="w-5 h-5 text-primary" />
                Envoyez-moi un message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="fade-in-delay-3">
                    <Label htmlFor="name">Nom complet *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Votre nom"
                      className="cyber-border"
                    />
                  </div>
                  <div className="fade-in-delay-4">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="votre@email.com"
                      className="cyber-border"
                    />
                  </div>
                </div>
                
                <div className="fade-in-delay-5">
                  <Label htmlFor="subject">Sujet</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Objet de votre message"
                    className="cyber-border"
                  />
                </div>
                
                <div className="fade-in-delay-6">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Décrivez votre projet ou vos besoins en cybersécurité..."
                    className="cyber-border"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full btn-cyber fade-in-delay-7 group" 
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
            <Card className="cyber-border hover:cyber-glow transition-all duration-500 fade-in-delay-3">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl font-orbitron">Informations de contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 sm:gap-4 fade-in-delay-4">
                  <div className="p-2 sm:p-3 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors duration-300">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base">Email</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">contact@cybersecpro.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 sm:gap-4 fade-in-delay-5">
                  <div className="p-2 sm:p-3 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors duration-300">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base">Téléphone</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">+33 (0)1 23 45 67 89</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 sm:gap-4 fade-in-delay-6">
                  <div className="p-2 sm:p-3 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors duration-300">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base">Localisation</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">Paris, France</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cyber-border hover:cyber-glow transition-all duration-500 fade-in-delay-4">
              <CardHeader>
                <CardTitle className="font-orbitron">Disponibilité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center fade-in-delay-5">
                    <span>Lundi - Vendredi</span>
                    <span className="text-muted-foreground">9h00 - 18h00</span>
                  </div>
                  <div className="flex justify-between items-center fade-in-delay-6">
                    <span>Samedi</span>
                    <span className="text-muted-foreground">10h00 - 16h00</span>
                  </div>
                  <div className="flex justify-between items-center fade-in-delay-7">
                    <span>Dimanche</span>
                    <span className="text-muted-foreground">Fermé</span>
                  </div>
                  <div className="mt-4 p-3 bg-success/10 rounded-lg border border-success/20 fade-in-delay-8">
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Réponse sous 24h garantie</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cyber-border hover:cyber-glow transition-all duration-500 fade-in-delay-5">
              <CardHeader>
                <CardTitle className="font-orbitron">Services disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 fade-in-delay-6">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Audit de sécurité</span>
                  </li>
                  <li className="flex items-center gap-2 fade-in-delay-7">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Tests d'intrusion</span>
                  </li>
                  <li className="flex items-center gap-2 fade-in-delay-8">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Formation cybersécurité</span>
                  </li>
                  <li className="flex items-center gap-2 fade-in-delay-8">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Consultation stratégique</span>
                  </li>
                  <li className="flex items-center gap-2 fade-in-delay-8">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Réponse aux incidents</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;