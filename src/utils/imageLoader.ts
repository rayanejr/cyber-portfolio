/**
 * Charge dynamiquement les images des projets
 * Gère à la fois les URLs Supabase Storage et les assets locaux
 */

// Charger toutes les images des projets avec Vite
const projectImages = import.meta.glob('/src/assets/projects/*.{png,jpg,jpeg,svg,webp}', { 
  eager: true,
  import: 'default'
}) as Record<string, string>;

const otherAssets = import.meta.glob('/src/assets/*.{png,jpg,jpeg,svg,webp}', { 
  eager: true,
  import: 'default'
}) as Record<string, string>;

// Combiner tous les assets
const allAssets = { ...projectImages, ...otherAssets };

export const getProjectImageUrl = (imageUrl: string | null): string => {
  if (!imageUrl) {
    return '/placeholder.svg';
  }

  // Si c'est déjà une URL complète (Supabase Storage), retourner tel quel
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Si c'est un chemin /src/assets/..., chercher dans les assets chargés
  if (imageUrl.startsWith('/src/assets/')) {
    const asset = allAssets[imageUrl];
    if (asset) {
      return asset;
    }
    console.warn(`Image non trouvée: ${imageUrl}`);
    return '/placeholder.svg';
  }

  // Pour tout autre cas, retourner tel quel
  return imageUrl;
};
