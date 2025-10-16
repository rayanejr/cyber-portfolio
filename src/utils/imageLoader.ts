/**
 * Charge dynamiquement les images des projets
 * Gère à la fois les URLs Supabase Storage et les assets locaux
 */

// Charger toutes les images des projets avec Vite
const projectImages = import.meta.glob<string>('/src/assets/projects/*.{png,jpg,jpeg,svg,webp}', { 
  eager: true,
  import: 'default'
});

const otherAssets = import.meta.glob<string>('/src/assets/*.{png,jpg,jpeg,svg,webp}', { 
  eager: true,
  import: 'default'
});

// Combiner tous les assets
const allAssets = { ...projectImages, ...otherAssets };

// Debug: afficher les assets chargés
console.log('[imageLoader] Assets disponibles:', Object.keys(allAssets));

export const getProjectImageUrl = (imageUrl: string | null): string => {
  console.log('[imageLoader] Traitement de:', imageUrl);
  
  if (!imageUrl) {
    console.log('[imageLoader] Pas d\'URL fournie, retour placeholder');
    return '/placeholder.svg';
  }

  // Si c'est déjà une URL complète (Supabase Storage), retourner tel quel
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    console.log('[imageLoader] URL complète détectée:', imageUrl);
    return imageUrl;
  }

  // Si c'est un chemin /src/assets/..., chercher dans les assets chargés
  if (imageUrl.startsWith('/src/assets/')) {
    console.log('[imageLoader] Recherche de l\'asset:', imageUrl);
    console.log('[imageLoader] Asset trouvé:', allAssets[imageUrl]);
    
    const asset = allAssets[imageUrl];
    if (asset) {
      console.log('[imageLoader] Retour de l\'asset:', asset);
      return asset;
    }
    
    console.warn(`[imageLoader] Image non trouvée: ${imageUrl}`);
    console.warn('[imageLoader] Assets disponibles:', Object.keys(allAssets).filter(k => k.includes('projects')));
    return '/placeholder.svg';
  }

  // Pour tout autre cas, retourner tel quel
  console.log('[imageLoader] Retour tel quel:', imageUrl);
  return imageUrl;
};
