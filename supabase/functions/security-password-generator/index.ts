import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { length = 16, includeNumbers = true, includeSpecialChars = true, includeUppercase = true, includeLowercase = true } = await req.json();

    // Validation selon les recommandations ANSSI
    if (length < 12) {
      return new Response(
        JSON.stringify({ error: 'Le mot de passe doit contenir au moins 12 caractères (recommandation ANSSI)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?~';
    
    let charset = '';
    let password = '';
    
    // Construire le charset et garantir au moins un caractère de chaque type
    if (includeLowercase) {
      charset += lowercase;
      password += lowercase[Math.floor(Math.random() * lowercase.length)];
    }
    if (includeUppercase) {
      charset += uppercase;
      password += uppercase[Math.floor(Math.random() * uppercase.length)];
    }
    if (includeNumbers) {
      charset += numbers;
      password += numbers[Math.floor(Math.random() * numbers.length)];
    }
    if (includeSpecialChars) {
      charset += special;
      password += special[Math.floor(Math.random() * special.length)];
    }
    
    // Compléter le mot de passe
    for (let i = password.length; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    
    // Mélanger le mot de passe pour éviter un pattern prévisible
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    // Calcul du score de force (entropie)
    const entropy = Math.log2(Math.pow(charset.length, length));
    let strength = 'Faible';
    if (entropy >= 60) strength = 'Très fort';
    else if (entropy >= 40) strength = 'Fort';
    else if (entropy >= 30) strength = 'Moyen';
    
    return new Response(
      JSON.stringify({ 
        password, 
        strength,
        entropy: Math.round(entropy),
        length: password.length,
        charset: charset.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
