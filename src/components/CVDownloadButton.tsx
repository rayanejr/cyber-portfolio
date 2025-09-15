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
        // Récupérer directement le CV depuis admin_files (accessible en public pour les CVs)
        const { data, error } = await supabase
          .from("admin_files")
          .select("file_url, filename")
          .eq("file_category", "cv")
          .eq("is_active", true)
          .like("file_type", "%pdf%") // Filtrer seulement les PDFs
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!error && data) {
          setResumeUrl(data.file_url);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du CV:", error);
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
