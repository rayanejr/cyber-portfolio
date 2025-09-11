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

    // Get the active CV file info using the secure function
    const { data: cvData, error: cvError } = await supabaseAdmin
      .rpc('get_active_cv_for_download');

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
    
    // Extract filename from the file_url (handle both full paths and just filenames)
    const fileName = cv.file_url.includes('/') ? cv.file_url.split('/').pop() : cv.file_url;
    
    if (!fileName) {
      console.error('Invalid file URL:', cv.file_url);
      return new Response(
        JSON.stringify({ error: 'Fichier CV introuvable' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create a signed URL for the CV file (valid for 5 minutes)
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from('admin-files')
      .createSignedUrl(fileName, 300); // 5 minutes

    if (signedUrlError) {
      console.error('Error creating signed URL:', signedUrlError);
      return new Response(
        JSON.stringify({ error: 'Impossible de générer le lien de téléchargement' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Log successful CV access (non-sensitive info)
    await supabaseAdmin
      .from('security_logs')
      .insert({
        event_type: 'CV_DOWNLOAD',
        severity: 'INFO',
        source: 'secure-cv-download',
        metadata: {
          filename: cv.filename,
          file_type: cv.file_type
        }
      });

    return new Response(
      JSON.stringify({ 
        signedUrl: signedUrlData.signedUrl,
        filename: cv.filename,
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