import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdminBootstrapData {
  email: string;
  fullName: string;
  password: string;
  bootstrapSecret?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Méthode non autorisée' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Initialize Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email, fullName, password, bootstrapSecret }: AdminBootstrapData = await req.json();

    // Get client IP for logging
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     '127.0.0.1';

    // Input validation
    if (!email || !fullName || !password) {
      return new Response(
        JSON.stringify({ error: 'Tous les champs sont obligatoires' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if any admin already exists
    const { data: existingAdmins, error: countError } = await supabaseAdmin
      .from('admin_users')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      console.error('Error checking existing admins:', countError);
      return new Response(
        JSON.stringify({ error: 'Erreur de vérification' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const adminCount = existingAdmins?.length || 0;

    // If admins exist, require bootstrap secret
    if (adminCount > 0) {
      const requiredSecret = Deno.env.get('ADMIN_BOOTSTRAP_SECRET');
      if (!requiredSecret || !bootstrapSecret || bootstrapSecret !== requiredSecret) {
        // Log failed bootstrap attempt
        await supabaseAdmin
          .from('security_logs')
          .insert({
            event_type: 'ADMIN_BOOTSTRAP_FAILED',
            severity: 'HIGH',
            source: 'admin-bootstrap',
            ip_address: clientIP,
            metadata: {
              reason: 'invalid_secret',
              existing_admin_count: adminCount,
              attempted_email: email
            }
          });

        return new Response(
          JSON.stringify({ error: 'Secret de bootstrap requis ou invalide' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Validate password strength (ANSSI recommendations)
    if (password.length < 12) {
      return new Response(
        JSON.stringify({ error: 'Le mot de passe doit contenir au moins 12 caractères' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    if (!hasLower || !hasUpper || !hasNumber || !hasSpecial) {
      return new Response(
        JSON.stringify({ 
          error: 'Le mot de passe doit contenir minuscules, majuscules, chiffres et caractères spéciaux' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create the admin user using the secure function
    const { data: newAdminData, error: createError } = await supabaseAdmin
      .rpc('create_first_super_admin', {
        p_email: email.toLowerCase().trim(),
        p_full_name: fullName.trim(),
        p_password: password
      });

    if (createError) {
      console.error('Error creating admin user:', createError);
      
      await supabaseAdmin
        .from('security_logs')
        .insert({
          event_type: 'ADMIN_CREATION_FAILED',
          severity: 'HIGH',
          source: 'admin-bootstrap',
          ip_address: clientIP,
          metadata: {
            error: createError.message,
            attempted_email: email
          }
        });

      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création de l\'administrateur' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Log successful admin creation
    await supabaseAdmin
      .from('security_logs')
      .insert({
        event_type: 'ADMIN_CREATED',
        severity: 'INFO',
        source: 'admin-bootstrap',
        ip_address: clientIP,
        metadata: {
          admin_id: newAdminData,
          email: email,
          is_first_admin: adminCount === 0
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Administrateur créé avec succès',
        adminId: newAdminData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in admin-bootstrap function:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});