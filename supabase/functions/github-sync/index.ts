import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  clone_url: string
  homepage: string | null
  topics: string[]
  language: string | null
  stargazers_count: number
  created_at: string
  updated_at: string
  visibility: string
}

interface GitHubContent {
  content: string
  encoding: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { username, token } = await req.json()

    if (!username || !token) {
      return new Response(
        JSON.stringify({ error: 'Username et token GitHub requis' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialiser Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Récupérer les repositories GitHub
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Supabase-Function'
      }
    })

    if (!reposResponse.ok) {
      throw new Error(`GitHub API error: ${reposResponse.status}`)
    }

    const repos: GitHubRepo[] = await reposResponse.json()
    console.log(`Trouvé ${repos.length} repositories`)

    const projectsToInsert = []

    for (const repo of repos) {
      try {
        // Récupérer le README
        let readmeContent = ''
        let imageUrl = ''
        
        try {
          const readmeResponse = await fetch(`https://api.github.com/repos/${repo.full_name}/contents/README.md`, {
            headers: {
              'Authorization': `token ${token}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'Supabase-Function'
            }
          })

          if (readmeResponse.ok) {
            const readmeData: GitHubContent = await readmeResponse.json()
            readmeContent = atob(readmeData.content.replace(/\n/g, ''))
            
            // Extraire la première image du README
            const imageRegex = /!\[.*?\]\((.*?)\)/
            const imageMatch = readmeContent.match(imageRegex)
            if (imageMatch && imageMatch[1]) {
              imageUrl = imageMatch[1]
              // Convertir les URLs relatives en URLs absolues
              if (imageUrl.startsWith('./') || imageUrl.startsWith('../')) {
                imageUrl = `https://raw.githubusercontent.com/${repo.full_name}/main/${imageUrl.replace('../', '').replace('./', '')}`
              } else if (!imageUrl.startsWith('http')) {
                imageUrl = `https://raw.githubusercontent.com/${repo.full_name}/main/${imageUrl}`
              }
            }
          }
        } catch (readmeError) {
          console.log(`Pas de README pour ${repo.name}:`, readmeError)
        }

        // Vérifier si le projet existe déjà
        const { data: existingProject } = await supabase
          .from('projects')
          .select('id')
          .eq('github_url', repo.html_url)
          .single()

        const projectData = {
          title: repo.name,
          description: repo.description || `Projet GitHub: ${repo.name}`,
          content: readmeContent || `# ${repo.name}\n\n${repo.description || 'Projet GitHub'}`,
          image_url: imageUrl || `https://opengraph.githubassets.com/1/${repo.full_name}`,
          demo_url: repo.homepage || null,
          github_url: repo.html_url,
          technologies: repo.topics.length > 0 ? repo.topics : (repo.language ? [repo.language] : []),
          featured: repo.stargazers_count > 5,
          is_active: true
        }

        if (existingProject) {
          // Mettre à jour le projet existant
          await supabase
            .from('projects')
            .update(projectData)
            .eq('id', existingProject.id)
          
          console.log(`Projet mis à jour: ${repo.name}`)
        } else {
          projectsToInsert.push(projectData)
        }

      } catch (error) {
        console.error(`Erreur pour le repo ${repo.name}:`, error)
      }
    }

    // Insérer les nouveaux projets
    if (projectsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('projects')
        .insert(projectsToInsert)

      if (insertError) {
        console.error('Erreur lors de l\'insertion:', insertError)
        throw insertError
      }

      console.log(`${projectsToInsert.length} nouveaux projets ajoutés`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synchronisation terminée: ${projectsToInsert.length} nouveaux projets, ${repos.length - projectsToInsert.length} mis à jour`,
        total_repos: repos.length,
        new_projects: projectsToInsert.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Erreur:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erreur lors de la synchronisation',
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})