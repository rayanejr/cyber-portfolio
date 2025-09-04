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

// Clé de chiffrement AES-256 sécurisée
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
    console.log('🔐 Test de chiffrement AES-256 started...');

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

    const result = {
      success: true,
      message: 'Test de chiffrement AES-256 completed',
      algorithm: 'AES-256-GCM',
      key_size: '256 bits',
      test_results: results,
      all_tests_passed: results.every(r => r.success)
    };

    console.log('🔐 Encryption test completed:', result);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('❌ Error in test-encryption function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message, details: error.stack }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

async function generateKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(ENCRYPTION_KEY.slice(0, 32));
  
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

serve(handler);