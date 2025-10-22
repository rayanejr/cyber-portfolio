import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function CVDownloadButton() {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        // Récupérer directement le CV depuis admin_files
        const { data, error } = await supabase
          .from("admin_files")
          .select("file_url, filename")
          .eq("file_category", "cv")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          setResumeUrl(data[0].file_url);
        }
      } catch (error) {
        const timestamp = new Intl.DateTimeFormat('fr-FR', {
          timeZone: 'Europe/Paris',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).format(new Date());
        console.error(`[CVDownload] ${timestamp} - Erreur lors de la récupération du CV:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResume();
  }, []);

  const handleDownload = async () => {
    if (!resumeUrl) {
      alert('CV temporairement indisponible');
      return;
    }

    try {
      // Utiliser fetch puis créer un Blob pour éviter le blocage par les adblockers
      const response = await fetch(resumeUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'Rayane_Jerbi_CV.pdf'; // Nom sans underscore au début
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Nettoyer l'URL blob après un délai
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
      
      console.log('CV téléchargé avec succès');
    } catch (error: any) {
      console.error('Error downloading CV:', error);
      // Fallback: ouverture dans nouvel onglet
      window.open(resumeUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Button 
      size="lg" 
      className="btn-matrix group w-full sm:w-auto"
      onClick={handleDownload}
      disabled={isLoading}
    >
      {isLoading ? 'Chargement...' : (resumeUrl ? 'Télécharger mon CV' : 'CV bientôt disponible')}
      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
    </Button>
  );
}