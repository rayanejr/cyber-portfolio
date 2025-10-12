import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GenerateProjectImageButtonProps {
  projectId: string;
  title: string;
  description?: string;
  technologies?: string[];
  onImageGenerated: (imageUrl: string) => void;
}

export const GenerateProjectImageButton = ({
  projectId,
  title,
  description,
  technologies,
  onImageGenerated
}: GenerateProjectImageButtonProps) => {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateImage = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-project-image-gemini', {
        body: { 
          projectId,
          title, 
          description,
          technologies 
        }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        onImageGenerated(data.imageUrl);
        toast({
          title: "Image générée",
          description: "L'image du projet a été générée avec succès.",
        });
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer l'image.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleGenerateImage}
      disabled={generating}
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
      {generating ? 'Génération...' : 'Générer image IA'}
    </Button>
  );
};
