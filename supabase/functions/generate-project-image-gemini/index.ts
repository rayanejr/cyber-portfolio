import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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

    console.log(`Generating image with Gemini for: ${title}`)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured')
    }

    // Construire le prompt pour la génération d'image
    const techList = Array.isArray(technologies) ? technologies.join(', ') : technologies || ''
    
    const prompt = `Generate a professional tech project illustration for: ${title}. 
    ${description ? `Context: ${description}.` : ''}
    ${techList ? `Technologies used: ${techList}.` : ''}
    Style: Modern, clean, professional design with tech elements, high quality, detailed, 16:9 aspect ratio, vibrant colors.`

    console.log('Calling Lovable AI Gateway with Gemini image model...')

    // Appel à Lovable AI Gateway avec le modèle Gemini image
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        modalities: ['image', 'text']
      })
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error('AI Gateway error:', aiResponse.status, errorText)
      throw new Error(`AI Gateway error: ${aiResponse.status}`)
    }

    const aiData = await aiResponse.json()
    console.log('Image generated successfully')

    // Extraire l'image base64 de la réponse
    const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url
    if (!imageUrl) {
      throw new Error('No image returned from AI')
    }

    // Convertir base64 en buffer
    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))

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
