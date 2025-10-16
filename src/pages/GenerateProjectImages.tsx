import { GenerateMultipleImagesButton } from "@/components/admin/GenerateMultipleImagesButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const GenerateProjectImages = () => {
  const navigate = useNavigate();
  
  // IDs des 3 projets à mettre à jour
  const projectIds = [
    "c1f8ef2a-fc14-4a32-95c1-a23520f1c715", // PfSense – DMZ INT/EXT
    "c5b3ff5c-2aad-4091-b28b-b59694021ad3", // Projets Web & Applications
    "bc4073ab-b14c-458a-8f46-565066850986"  // Stage 3S Groupe
  ];

  const handleSuccess = () => {
    setTimeout(() => {
      navigate('/projects');
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Button
        onClick={() => navigate('/projects')}
        variant="ghost"
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour aux projets
      </Button>

      <Card className="cyber-border max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-orbitron cyber-text">
            Génération d'images de projets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Les images seront générées pour les projets suivants :
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>PfSense – DMZ INT/EXT</li>
              <li>Projets Web & Applications</li>
              <li>Stage 3S Groupe</li>
            </ul>
          </div>

          <div className="pt-4">
            <GenerateMultipleImagesButton 
              projectIds={projectIds}
              onSuccess={handleSuccess}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Note : La génération peut prendre quelques minutes. Vous serez redirigé automatiquement une fois terminé.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GenerateProjectImages;