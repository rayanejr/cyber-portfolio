import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CVDownloadButton = () => {
  const [cvFile, setCvFile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCV();
  }, []);

  const fetchCV = async () => {
    try {
      // Vérifier si un CV est disponible via la fonction sécurisée
      const { data, error } = await supabase.functions.invoke('secure-cv-download');
      
      if (!error && data && !data.error) {
        // Si on a reçu des données valides, le CV est disponible
        setCvFile({ available: true, filename: data.filename });
      } else {
        // Pas de CV disponible ou erreur
        setCvFile(null);
      }
    } catch (error) {
      console.error('Error checking CV availability:', error);
      // En cas d'erreur, on considère qu'aucun CV n'est disponible
      setCvFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      // Appeler la fonction edge sécurisée pour obtenir l'URL signée
      const { data, error } = await supabase.functions.invoke('secure-cv-download');

      if (error) {
        console.error('Error calling secure-cv-download:', error);
        toast({
          title: "Erreur de téléchargement",
          description: "Impossible d'accéder au CV.",
          variant: "destructive"
        });
        return;
      }

      if (data?.error) {
        toast({
          title: "CV non disponible",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      if (data?.signedUrl) {
        // Ouvrir l'URL signée dans un nouvel onglet
        window.open(data.signedUrl, '_blank');
      } else {
        toast({
          title: "Erreur de téléchargement",
          description: "Impossible de générer le lien de téléchargement.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Erreur de téléchargement",
        description: "Une erreur est survenue lors du téléchargement.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Button
        variant="outline"
        size="lg"
        disabled
        className="btn-ghost-cyber w-full sm:w-auto"
      >
        <Download className="mr-2 h-5 w-5" />
        Chargement...
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleDownload}
      className="btn-ghost-cyber w-full sm:w-auto"
    >
      <Download className="mr-2 h-5 w-5" />
      {cvFile?.available ? "Voir mon CV" : "CV bientôt disponible"}
    </Button>
  );
};

export default CVDownloadButton;