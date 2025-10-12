import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserManagementRequest {
  action: 'list' | 'create' | 'update' | 'delete';
  email?: string;
  password?: string;
  userId?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verify the user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get the user from the JWT token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { action, email, password, userId }: UserManagementRequest = await req.json();

    switch (action) {
      case 'list': {
        const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
        
        if (error) {
          console.error('Error listing users:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        // Return sanitized user data
        const sanitizedUsers = users.users.map(u => ({
          id: u.id,
          email: u.email || 'Email non défini',
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          email_confirmed_at: u.email_confirmed_at,
        }));

        return new Response(
          JSON.stringify({ users: sanitizedUsers }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create': {
        if (!email || !password) {
          return new Response(
            JSON.stringify({ error: 'Email and password are required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true
        });

        if (error) {
          console.error('Error creating user:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        return new Response(
          JSON.stringify({ user: data.user }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update': {
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'User ID is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        const updateData: any = {};
        if (email) updateData.email = email;
        if (password) updateData.password = password;

        if (Object.keys(updateData).length === 0) {
          return new Response(
            JSON.stringify({ error: 'No fields to update' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          updateData
        );

        if (error) {
          console.error('Error updating user:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        return new Response(
          JSON.stringify({ user: data.user }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete': {
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'User ID is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (error) {
          console.error('Error deleting user:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    }

  } catch (error) {
    console.error('User management error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});