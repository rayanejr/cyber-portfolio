import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { email, password, full_name } = await req.json()
    
    const adminEmail = email || 'admin@cybersecpro.com'
    const adminPassword = password || 'AdminCyberSec2024!@#'
    const adminFullName = full_name || 'Super Administrateur'

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create the admin user in auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: adminFullName
      }
    })

    if (authError && !authError.message.includes('already been registered')) {
      throw authError
    }

    const userId = authData?.user?.id || (await supabaseAdmin.auth.admin.listUsers())
      .data.users.find(u => u.email === adminEmail)?.id

    if (!userId) {
      throw new Error('Failed to create or find admin user')
    }

    // Create or update admin_users entry
    const { error: dbError } = await supabaseAdmin
      .from('admin_users')
      .upsert({
        id: userId,
        email: adminEmail,
        full_name: adminFullName,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })

    if (dbError) {
      throw dbError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin user created successfully',
        credentials: {
          email: adminEmail,
          password: adminPassword
        },
        user_id: userId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error creating admin:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})