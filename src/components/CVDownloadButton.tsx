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
        // Utiliser la function Supabase pour récupérer le CV de manière sécurisée
        const { data, error } = await supabase.functions.invoke('secure-cv-download');
        
        if (!error && data?.signedUrl) {
          setResumeUrl(data.signedUrl);
        } else {
          // Fallback: essayer de récupérer directement depuis admin_files
          const { data: fileData } = await supabase
            .from("admin_files")
            .select("file_url")
            .eq("file_category", "cv")
            .eq("is_active", true)
            .single();
          
          if (fileData?.file_url) {
            setResumeUrl(fileData.file_url);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du CV:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResume();
  }, []);

  // Toujours afficher le bouton, même s'il n'y a pas de CV
  return (
    <Button 
      size="lg" 
      className="btn-cyber group w-full sm:w-auto"
      onClick={() => {
        if (resumeUrl) {
          window.open(resumeUrl, '_blank', 'noopener,noreferrer');
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
