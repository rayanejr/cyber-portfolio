import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting veille cleanup process...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Garder seulement les éléments des 7 derniers jours
    const retentionDays = 7;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    console.log(`Deleting veille items older than ${cutoffDate.toISOString()}`);

    // Supprimer les anciens éléments
    const { data: deletedItems, error: deleteError } = await supabase
      .from('veille_techno')
      .delete()
      .lt('imported_at', cutoffDate.toISOString())
      .select('id');

    if (deleteError) {
      console.error('Error deleting old items:', deleteError);
      throw deleteError;
    }

    const deletedCount = deletedItems?.length || 0;
    console.log(`Successfully deleted ${deletedCount} old veille items`);

    // Obtenir les statistiques actuelles
    const { data: currentItems, error: countError } = await supabase
      .from('veille_techno')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting current items:', countError);
      throw countError;
    }

    const remainingCount = currentItems?.length || 0;
    console.log(`${remainingCount} items remaining in database`);

    // Également nettoyer les éléments marqués comme inactifs depuis plus de 30 jours
    const inactiveCutoff = new Date();
    inactiveCutoff.setDate(inactiveCutoff.getDate() - 30);

    const { data: deletedInactive, error: inactiveError } = await supabase
      .from('veille_techno')
      .delete()
      .eq('is_active', false)
      .lt('updated_at', inactiveCutoff.toISOString())
      .select('id');

    if (inactiveError) {
      console.error('Error deleting inactive items:', inactiveError);
    } else {
      const inactiveDeletedCount = deletedInactive?.length || 0;
      console.log(`Deleted ${inactiveDeletedCount} old inactive items`);
    }

    const response = {
      success: true,
      deleted_old_items: deletedCount,
      deleted_inactive_items: deletedInactive?.length || 0,
      remaining_items: remainingCount,
      retention_days: retentionDays,
      cleanup_date: new Date().toISOString()
    };

    console.log('Cleanup completed successfully:', response);

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Veille cleanup failed:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});