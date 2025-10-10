import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { title, description, technologies, projectId } = await req.json()

    if (!title) {
      throw new Error('Project title is required')
    }

    console.log(`Generating image for: ${title}`)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const hfToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN')
    if (!hfToken) {
      throw new Error('HUGGING_FACE_ACCESS_TOKEN is not configured')
    }

    const hf = new HfInference(hfToken)

    // Construire le prompt pour la génération d'image
    const techList = Array.isArray(technologies) ? technologies.join(', ') : technologies || ''
    
    const prompt = `Professional tech project illustration: ${title}. 
    ${description ? `Context: ${description}.` : ''}
    ${techList ? `Technologies: ${techList}.` : ''}
    Modern, clean, professional design with tech elements, high quality, detailed, 16:9 aspect ratio.`

    console.log('Generating image with HuggingFace FLUX.1-schnell...')

    const image = await hf.textToImage({
      inputs: prompt,
      model: 'black-forest-labs/FLUX.1-schnell',
    })

    // Convertir l'image en buffer
    const arrayBuffer = await image.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Générer un nom de fichier unique
    const fileName = `${projectId || Date.now()}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`

    console.log('Uploading image to Supabase Storage...')

    // Upload vers Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('projects')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw uploadError
    }

    // Récupérer l'URL publique
    const { data: { publicUrl } } = supabase
      .storage
      .from('projects')
      .getPublicUrl(fileName)

    console.log('Image uploaded successfully:', publicUrl)

    // Mettre à jour le projet avec l'URL de l'image si projectId est fourni
    if (projectId) {
      const { error: updateError } = await supabase
        .from('projects')
        .update({ image_url: publicUrl })
        .eq('id', projectId)

      if (updateError) {
        console.error('Error updating project:', updateError)
      }
    }

    return new Response(
      JSON.stringify({ imageUrl: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate image', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
