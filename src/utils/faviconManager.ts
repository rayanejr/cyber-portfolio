import { supabase } from "@/integrations/supabase/client";

export async function updateFavicon() {
  try {
    const { data } = await supabase
      .from('admin_files')
      .select('file_url')
      .eq('file_category', 'logos')
      .eq('is_active', true)
      .maybeSingle();
    
    if (data?.file_url) {
      let favicon = document.getElementById('dynamic-favicon') as HTMLLinkElement;
      
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.id = 'dynamic-favicon';
        favicon.rel = 'icon';
        favicon.type = 'image/png';
        document.head.appendChild(favicon);
      }
      
      favicon.href = data.file_url;
    }
  } catch (error) {
    console.error('Erreur lors du chargement du favicon:', error);
  }
}

// Initialiser le favicon au chargement
export function initFavicon() {
  updateFavicon();
  
  // Écouter les changements de logo
  window.addEventListener('logoUpdated', updateFavicon);
}
