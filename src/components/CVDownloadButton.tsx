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

  return (
    <Button 
      size="lg" 
      className="btn-cyber group w-full sm:w-auto"
      onClick={() => {
        if (resumeUrl) {
          // Créer un lien de téléchargement
          const link = document.createElement('a');
          link.href = resumeUrl;
          link.download = 'CV_Rayane_Jerbi.pdf';
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          alert('CV temporairement indisponible');
        }
      }}
      disabled={isLoading}
    >
      {isLoading ? 'Chargement...' : (resumeUrl ? 'Télécharger mon CV' : 'CV bientôt disponible')}
      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
    </Button>
  );
}
