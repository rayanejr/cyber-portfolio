import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Loader2 } from "lucide-react";

interface GenerateMultipleImagesButtonProps {
  projectIds: string[];
  onSuccess?: () => void;
}

export const GenerateMultipleImagesButton = ({ 
  projectIds,
  onSuccess 
}: GenerateMultipleImagesButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateImages = async () => {
    setIsGenerating(true);
    
    try {
      // Fetch projects data
      const { data: projects, error: fetchError } = await supabase
        .from('projects')
        .select('id, title, description')
        .in('id', projectIds);

      if (fetchError) throw fetchError;
      if (!projects || projects.length === 0) {
        toast({
          title: "Erreur",
          description: "Aucun projet trouvé",
          variant: "destructive",
        });
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      // Generate images for each project
      for (const project of projects) {
        try {
          toast({
            title: "Génération en cours",
            description: `Génération de l'image pour "${project.title}"...`,
          });

          const { data, error } = await supabase.functions.invoke(
            'generate-project-images-lovable',
            {
              body: {
                projectTitle: project.title,
                projectDescription: project.description
              }
            }
          );

          if (error) throw error;

          if (data?.imageUrl) {
            // Update project with new image URL
            const { error: updateError } = await supabase
              .from('projects')
              .update({ image_url: data.imageUrl })
              .eq('id', project.id);

            if (updateError) throw updateError;

            successCount++;
            toast({
              title: "Image générée",
              description: `Image générée pour "${project.title}"`,
            });
          }
        } catch (err) {
          console.error(`Error generating image for ${project.title}:`, err);
          errorCount++;
          toast({
            title: "Erreur",
            description: `Échec pour "${project.title}": ${err instanceof Error ? err.message : 'Erreur inconnue'}`,
            variant: "destructive",
          });
        }
      }

      if (successCount > 0) {
        toast({
          title: "Génération terminée",
          description: `${successCount} image(s) générée(s) avec succès${errorCount > 0 ? `, ${errorCount} échec(s)` : ''}`,
        });
        onSuccess?.();
      }

    } catch (error) {
      console.error('Error in generateImages:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la génération des images",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generateImages}
      disabled={isGenerating || projectIds.length === 0}
      className="btn-cyber"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Génération...
        </>
      ) : (
        <>
          <Wand2 className="w-4 h-4 mr-2" />
          Générer {projectIds.length} image(s)
        </>
      )}
    </Button>
  );
};