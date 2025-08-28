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
      const { data, error } = await supabase
        .from('admin_files')
        .select('*')
        .eq('file_category', 'cv')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setCvFile(data);
    } catch (error) {
      console.error('Error fetching CV:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (cvFile?.file_url) {
      window.open(cvFile.file_url, '_blank');
    } else {
      toast({
        title: "CV non disponible",
        description: "Le CV n'est pas encore disponible au téléchargement.",
        variant: "destructive"
      });
    }
  };

  if (loading || !cvFile) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleDownload}
      className="btn-ghost-cyber"
    >
      <Download className="mr-2 h-5 w-5" />
      Télécharger mon CV
    </Button>
  );
};

export default CVDownloadButton;