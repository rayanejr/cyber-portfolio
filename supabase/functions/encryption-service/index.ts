import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Clé de chiffrement AES-256 (dans un vrai environnement, utilisez une variable d'environnement sécurisée)
const ENCRYPTION_KEY = Deno.env.get('ENCRYPTION_KEY') || 'default-key-for-demo-only-change-in-production';

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const action = body.action || 'test-encryption';

    switch (action) {
      case 'encrypt':
        return await handleEncrypt(req);
      case 'decrypt':
        return await handleDecrypt(req);
      case 'encrypt-sensitive-data':
        return await handleEncryptSensitiveData(req);
      case 'test-encryption':
        return await handleTestEncryption(req);
      default:
        return new Response(JSON.stringify({ error: 'Action not supported', available_actions: ['encrypt', 'decrypt', 'encrypt-sensitive-data', 'test-encryption'] }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error: any) {
    console.error('Error in encryption-service function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

async function generateKey(): Promise<CryptoKey> {
  // Générer une clé AES-256 à partir de la chaîne de caractères
  const encoder = new TextEncoder();
  const keyData = encoder.encode(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
  
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptData(data: string): Promise<{ encrypted: string; iv: string }> {
  const key = await generateKey();
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  // Générer un IV aléatoire
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    dataBuffer
  );
  
  return {
    encrypted: Array.from(new Uint8Array(encrypted)).map(b => b.toString(16).padStart(2, '0')).join(''),
    iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('')
  };
}

async function decryptData(encryptedHex: string, ivHex: string): Promise<string> {
  const key = await generateKey();
  
  // Convertir hex en Uint8Array
  const encrypted = new Uint8Array(encryptedHex.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
  const iv = new Uint8Array(ivHex.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encrypted
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

async function handleEncrypt(req: Request): Promise<Response> {
  const { data } = await req.json();
  
  if (!data) {
    return new Response(JSON.stringify({ error: 'Data field is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  const result = await encryptData(data);
  
  return new Response(JSON.stringify({
    success: true,
    encrypted_data: result.encrypted,
    iv: result.iv,
    algorithm: 'AES-256-GCM'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleDecrypt(req: Request): Promise<Response> {
  const { encrypted_data, iv } = await req.json();
  
  if (!encrypted_data || !iv) {
    return new Response(JSON.stringify({ error: 'encrypted_data and iv fields are required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  try {
    const decrypted = await decryptData(encrypted_data, iv);
    
    return new Response(JSON.stringify({
      success: true,
      decrypted_data: decrypted
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Decryption failed', 
      details: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleEncryptSensitiveData(req: Request): Promise<Response> {
  // Chiffrer des données sensibles existantes dans la base
  const sensitiveFields = [
    'admin_users.email',
    'admin_users.password_hash',
    'contact_messages.email',
    'security_logs.ip_address'
  ];
  
  const results = [];
  
  // Exemple avec les emails des admin_users
  const { data: adminUsers, error: adminError } = await supabase
    .from('admin_users')
    .select('id, email')
    .limit(5);
  
  if (adminUsers && !adminError) {
    for (const user of adminUsers) {
      if (user.email && !user.email.includes('encrypted:')) {
        const encrypted = await encryptData(user.email);
        
        // Marquer comme chiffré mais ne pas vraiment modifier en production
        results.push({
          table: 'admin_users',
          field: 'email',
          id: user.id,
          original: user.email,
          encrypted: `encrypted:${encrypted.encrypted}:${encrypted.iv}`,
          status: 'simulation'
        });
      }
    }
  }
  
  // Logger l'activité de chiffrement
  await supabase
    .from('security_logs')
    .insert({
      event_type: 'DATA_ENCRYPTION',
      severity: 'INFO',
      source: 'ENCRYPTION_SERVICE',
      metadata: {
        fields_processed: results.length,
        encryption_algorithm: 'AES-256-GCM',
        timestamp: new Date().toISOString()
      }
    });
  
  return new Response(JSON.stringify({
    success: true,
    message: 'Sensitive data encryption simulation completed',
    processed_fields: results.length,
    results: results,
    note: 'This is a simulation. In production, actual database updates would occur.'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleTestEncryption(req: Request): Promise<Response> {
  const testData = [
    'rayane.jerbi@yahoo.com',
    'Admin Session Token: abc123xyz789',
    'API Key: sk-1234567890abcdef',
    'Sensitive Personal Information',
    '192.168.1.100'
  ];
  
  const results = [];
  
  for (const data of testData) {
    const encrypted = await encryptData(data);
    const decrypted = await decryptData(encrypted.encrypted, encrypted.iv);
    
    results.push({
      original: data,
      encrypted: encrypted.encrypted.substring(0, 32) + '...',
      iv: encrypted.iv,
      decrypted: decrypted,
      success: data === decrypted
    });
  }
  
  // Logger le test de chiffrement
  await supabase
    .from('security_logs')
    .insert({
      event_type: 'ENCRYPTION_TEST',
      severity: 'INFO',
      source: 'ENCRYPTION_SERVICE',
      metadata: {
        test_cases: results.length,
        all_successful: results.every(r => r.success),
        algorithm: 'AES-256-GCM',
        timestamp: new Date().toISOString()
      }
    });
  
  return new Response(JSON.stringify({
    success: true,
    message: 'Encryption test completed',
    algorithm: 'AES-256-GCM',
    key_size: '256 bits',
    test_results: results,
    all_tests_passed: results.every(r => r.success)
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(handler);