import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdminBootstrapData {
  secret: string;
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminBootstrapSecret = Deno.env.get('ADMIN_BOOTSTRAP_SECRET')!;
    
    // Initialize Supabase client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { secret }: AdminBootstrapData = await req.json();

    // Vérifier le secret de bootstrap
    if (secret !== adminBootstrapSecret) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adminEmail = 'admin@cybersecpro.com';
    const adminPassword = 'AdminCyberSec2024!@#';
    
    console.log('Creating admin user in Supabase Auth...');
    
    // Créer l'utilisateur admin dans Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true
    });

    if (authError && !authError.message.includes('already been registered')) {
      console.error('Auth creation error:', authError);
      return new Response(
        JSON.stringify({ error: `Failed to create auth user: ${authError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let userId = authUser?.user?.id;
    
    // Si l'utilisateur existe déjà, le récupérer
    if (authError?.message.includes('already been registered')) {
      console.log('User already exists, fetching existing user...');
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = users.users.find(u => u.email === adminEmail);
      userId = existingUser?.id;
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Could not create or find user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Linking admin user with auth user ID:', userId);
    
    // Mettre à jour l'enregistrement admin_users pour lier avec l'auth user
    const { error: updateError } = await supabaseAdmin
      .from('admin_users')
      .update({ auth_user_id: userId })
      .eq('email', adminEmail);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ error: `Failed to link admin user: ${updateError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Admin bootstrap completed successfully');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin user created and linked successfully',
        credentials: {
          email: adminEmail,
          password: adminPassword
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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