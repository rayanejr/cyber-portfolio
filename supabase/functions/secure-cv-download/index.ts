import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for admin-files access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the active CV file info directly from admin_files
    const { data: cvData, error: cvError } = await supabaseAdmin
      .from('admin_files')
      .select('file_url, filename, file_type')
      .eq('file_category', 'cv')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (cvError) {
      console.error('Error fetching CV info:', cvError);
      return new Response(
        JSON.stringify({ error: 'CV non disponible' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!cvData || cvData.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Aucun CV disponible' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const cv = cvData[0];
    
    // The file_url is already a full public URL from storage
    // Just return it directly
    return new Response(
      JSON.stringify({ 
        signedUrl: cv.file_url,
        filename: cv.filename || 'CV_Rayane_Jerbi.pdf',
        available: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in secure-cv-download function:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
