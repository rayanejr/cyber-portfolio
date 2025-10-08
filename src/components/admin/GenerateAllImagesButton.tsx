import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

export const GenerateAllImagesButton = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAllImages = async () => {
    setIsGenerating(true);
    toast({
      title: "Génération des images...",
      description: "Cela peut prendre plusieurs minutes",
    });

    try {
      const { data, error } = await supabase.functions.invoke('generate-all-project-images');

      if (error) throw error;

      toast({
        title: "Images générées avec succès",
        description: `${data.successCount} images créées sur ${data.totalProjects} projets`,
      });

      // Recharger la page pour voir les nouvelles images
      window.location.reload();
    } catch (error: any) {
      console.error('Error generating images:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={handleGenerateAllImages}
      disabled={isGenerating}
      className="gap-2"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Génération en cours...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          Générer toutes les images
        </>
      )}
    </Button>
  );
};
