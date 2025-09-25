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

// Clé de chiffrement AES-256 sécurisée - OBLIGATOIRE
const ENCRYPTION_KEY = Deno.env.get('ENCRYPTION_KEY');

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
  throw new Error('ENCRYPTION_KEY must be set and at least 32 characters long');
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Vérifier l'authentification - fonction maintenant protégée
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401, headers: corsHeaders }
    );
  }

  try {
    let body: any = {};
    let action = 'test-encryption';
    
    try {
      body = await req.json();
      action = body?.action || 'test-encryption';
    } catch (e) {
      console.log('Body vide ou invalide, utilisation de action par défaut:', action);
    }

    console.log(`Encryption Service - Action: ${action}`);

    switch (action) {
      case 'encrypt':
        return await handleEncrypt(body);
      case 'decrypt':
        return await handleDecrypt(body);
      case 'encrypt-sensitive-data':
        return await handleEncryptSensitiveData();
      case 'test-encryption':
        return await handleTestEncryption();
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
  // Générer une clé AES-256 à partir de la chaîne de caractères sécurisée
  const encoder = new TextEncoder();
  const keyData = encoder.encode(ENCRYPTION_KEY!.slice(0, 32));
  
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

async function handleEncrypt(body: any): Promise<Response> {
  const { data } = body;
  
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

async function handleDecrypt(body: any): Promise<Response> {
  const { encrypted_data, iv } = body;
  
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
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleEncryptSensitiveData(): Promise<Response> {
  // Test de chiffrement sécurisé - plus d'exposition de données sensibles
  const testResults = [];
  
  try {
    // Test seulement avec des données de test
    const testData = 'sample-test-data-' + Date.now();
    const encrypted = await encryptData(testData);
    
    // Tester le déchiffrement
    const decrypted = await decryptData(encrypted.encrypted, encrypted.iv);
    
    testResults.push({
      test: 'encryption_roundtrip',
      status: decrypted === testData ? 'success' : 'failed',
      encrypted_length: encrypted.encrypted.length
    });
  } catch (error) {
    testResults.push({
      test: 'encryption_roundtrip',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Logger l'activité de test seulement
  await supabase
    .from('security_logs')
    .insert({
      event_type: 'ENCRYPTION_TEST',
      severity: 'INFO',
      source: 'ENCRYPTION_SERVICE',
      metadata: {
        test_count: testResults.length,
        timestamp: new Date().toISOString()
      }
    });

  return new Response(JSON.stringify({
    success: true,
    message: 'Test de chiffrement effectué',
    results: testResults,
    summary: {
      tests_run: testResults.length,
      passed: testResults.filter(r => r.status === 'success').length
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleTestEncryption(): Promise<Response> {
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