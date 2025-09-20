import { useState } from 'react';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const AdminBootstrap = () => {
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const { toast } = useToast();

  const bootstrapAdmin = async () => {
    setIsBootstrapping(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-bootstrap', {
        body: { secret: 'bootstrap-secret-2024' }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Admin créé avec succès",
        description: `Utilisez: ${data.credentials.email} / ${data.credentials.password}`,
      });
    } catch (error) {
      console.error('Bootstrap error:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la création de l'admin",
        variant: "destructive",
      });
    } finally {
      setIsBootstrapping(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-muted">
      <h3 className="text-lg font-semibold mb-2">Bootstrap Admin</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Cliquez pour créer le compte administrateur par défaut.
      </p>
      <Button 
        onClick={bootstrapAdmin} 
        disabled={isBootstrapping}
        variant="outline"
      >
        {isBootstrapping ? 'Création en cours...' : 'Créer Admin'}
      </Button>
    </div>
  );
};