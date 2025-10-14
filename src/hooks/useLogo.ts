import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const LOGO_CACHE_KEY = 'portfolio_logo_url';
const LOGO_CACHE_TIMESTAMP_KEY = 'portfolio_logo_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    // Essayer de récupérer le logo du cache au démarrage
    const cached = localStorage.getItem(LOGO_CACHE_KEY);
    const timestamp = localStorage.getItem(LOGO_CACHE_TIMESTAMP_KEY);
    
    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      if (age < CACHE_DURATION) {
        return cached;
      }
    }
    return null;
  });

  const fetchLogo = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_files')
        .select('file_url')
        .eq('file_category', 'logos')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data?.file_url) {
        const url = data.file_url;
        setLogoUrl(url);
        // Mettre en cache
        localStorage.setItem(LOGO_CACHE_KEY, url);
        localStorage.setItem(LOGO_CACHE_TIMESTAMP_KEY, Date.now().toString());
      } else if (error) {
        console.error('[useLogo] Erreur lors de la récupération du logo:', error);
      } else {
        // Pas de logo trouvé
        setLogoUrl(null);
        localStorage.removeItem(LOGO_CACHE_KEY);
        localStorage.removeItem(LOGO_CACHE_TIMESTAMP_KEY);
      }
    } catch (error) {
      console.error('[useLogo] Erreur lors de la récupération du logo:', error);
    }
  };

  useEffect(() => {
    // Fetch initial si pas de cache valide
    if (!logoUrl) {
      fetchLogo();
    }

    // Écouter les mises à jour du logo
    const handleLogoUpdate = () => {
      // Invalider le cache
      localStorage.removeItem(LOGO_CACHE_KEY);
      localStorage.removeItem(LOGO_CACHE_TIMESTAMP_KEY);
      fetchLogo();
    };

    window.addEventListener('logoUpdated', handleLogoUpdate);

    // Rafraîchir périodiquement le logo (toutes les 5 minutes)
    const interval = setInterval(() => {
      fetchLogo();
    }, CACHE_DURATION);

    return () => {
      window.removeEventListener('logoUpdated', handleLogoUpdate);
      clearInterval(interval);
    };
  }, []);

  return logoUrl;
}
