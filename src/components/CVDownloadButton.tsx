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
        const { data, error } = await supabase
          .from("admin_files")
          .select("file_url, filename")
          .eq("file_category", "cv")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          setResumeUrl(data.file_url);
        }
      } catch (error) {
        console.error('[CVDownload] Erreur:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResume();
  }, []);

  const handleDownload = () => {
    if (!resumeUrl) {
      alert('CV temporairement indisponible');
      return;
    }
    
    // Ouvrir directement dans un nouvel onglet (évite ERR_BLOCKED_BY_CLIENT)
    window.open(resumeUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button 
      size="lg" 
      className="btn-matrix group w-full sm:w-auto"
      onClick={handleDownload}
      disabled={isLoading}
    >
      {isLoading ? 'Chargement...' : (resumeUrl ? 'Voir mon CV' : 'CV bientôt disponible')}
      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
    </Button>
  );
}