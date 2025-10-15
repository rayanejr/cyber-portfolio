/**
 * Charge dynamiquement les images des projets
 * Gère à la fois les URLs Supabase Storage et les assets locaux
 */
export const getProjectImageUrl = (imageUrl: string | null): string => {
  if (!imageUrl) {
    return '/placeholder.svg';
  }

  // Si c'est déjà une URL complète (Supabase Storage), retourner tel quel
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Si c'est un chemin /src/assets/..., le convertir pour Vite
  if (imageUrl.startsWith('/src/assets/')) {
    // Retirer le préfixe /src et utiliser le chemin relatif
    const assetPath = imageUrl.replace('/src/', '@/');
    
    // Pour le build de production, les assets doivent être dans public/
    // ou importés correctement via Vite
    try {
      // Essayer de construire l'URL avec Vite
      const path = imageUrl.replace('/src/assets/', '/assets/');
      return path;
    } catch {
      return '/placeholder.svg';
    }
  }

  // Pour tout autre cas, retourner tel quel
  return imageUrl;
};
