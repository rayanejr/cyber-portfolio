import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  html_url: string;
  homepage?: string;
  topics: string[];
  language?: string;
  stargazers_count: number;
  created_at: string;
  updated_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, username, token, projectData, repoName } = await req.json();
    console.log(`Action: ${action}`);

    switch (action) {
      case 'sync_from_github':
        return await syncFromGitHub(username, token);
      
      case 'push_to_github':
        return await pushProjectToGitHub(username, token, projectData);
      
      case 'update_github_project':
        return await updateGitHubProject(username, token, projectData, repoName);
      
      case 'delete_from_github':
        return await deleteFromGitHub(username, token, repoName);
      
      default:
        throw new Error('Action non supportée');
    }
  } catch (error) {
    console.error('Erreur:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function syncFromGitHub(username: string, token: string) {
  console.log(`Synchronisation des projets pour ${username}`);
  
  // Récupérer tous les repositories
  const repos = await fetchGitHubRepos(username, token);
  let newProjects = 0;
  let updatedProjects = 0;

  for (const repo of repos) {
    try {
      // Vérifier si le projet existe déjà
      const { data: existingProject } = await supabase
        .from('projects')
        .select('id, github_url')
        .eq('github_url', repo.html_url)
        .single();

      // Récupérer le README
      const readme = await fetchRepoReadme(username, repo.name, token);
      
      const projectData = {
        title: repo.name.replace(/-/g, ' ').replace(/_/g, ' '),
        description: repo.description || `Projet ${repo.name}`,
        content: readme || `# ${repo.name}\n\n${repo.description || 'Description non disponible'}`,
        github_url: repo.html_url,
        demo_url: repo.homepage || null,
        technologies: [repo.language, ...repo.topics].filter(Boolean),
        featured: repo.stargazers_count > 5,
        is_active: true,
        image_url: await extractImageFromReadme(readme) || null
      };

      if (existingProject) {
        // Mettre à jour le projet existant
        await supabase
          .from('projects')
          .update(projectData)
          .eq('id', existingProject.id);
        updatedProjects++;
      } else {
        // Créer un nouveau projet
        await supabase
          .from('projects')
          .insert([projectData]);
        newProjects++;
      }
    } catch (error) {
      console.error(`Erreur lors du traitement de ${repo.name}:`, error);
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: `Synchronisation terminée: ${newProjects} nouveaux projets, ${updatedProjects} mis à jour`,
      total_repos: repos.length,
      new_projects: newProjects,
      updated_projects: updatedProjects
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function pushProjectToGitHub(username: string, token: string, projectData: any) {
  console.log(`Création du repository ${projectData.title} sur GitHub`);
  
  const repoName = projectData.title.toLowerCase().replace(/\s+/g, '-');
  
  // Créer le repository sur GitHub
  const createRepoResponse = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: repoName,
      description: projectData.description,
      homepage: projectData.demo_url,
      private: false,
      auto_init: true
    })
  });

  if (!createRepoResponse.ok) {
    const error = await createRepoResponse.json();
    throw new Error(`Erreur lors de la création du repository: ${error.message}`);
  }

  const newRepo = await createRepoResponse.json();

  // Créer un README basé sur le contenu du projet
  const readmeContent = btoa(unescape(encodeURIComponent(createReadmeContent(projectData))));
  
  await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/README.md`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'Initial README',
      content: readmeContent
    })
  });

  // Mettre à jour le projet dans la base de données avec l'URL GitHub
  await supabase
    .from('projects')
    .update({ github_url: newRepo.html_url })
    .eq('id', projectData.id);

  return new Response(
    JSON.stringify({
      success: true,
      message: `Repository ${repoName} créé avec succès sur GitHub`,
      github_url: newRepo.html_url
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateGitHubProject(username: string, token: string, projectData: any, repoName: string) {
  console.log(`Mise à jour du repository ${repoName} sur GitHub`);
  
  // Mettre à jour les informations du repository
  await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: projectData.description,
      homepage: projectData.demo_url
    })
  });

  // Mettre à jour le README
  const readmeContent = btoa(unescape(encodeURIComponent(createReadmeContent(projectData))));
  
  // Récupérer le SHA du fichier README existant
  const readmeResponse = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/README.md`, {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    }
  });

  let sha = null;
  if (readmeResponse.ok) {
    const readmeData = await readmeResponse.json();
    sha = readmeData.sha;
  }

  await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/README.md`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'Update README from portfolio',
      content: readmeContent,
      sha: sha
    })
  });

  return new Response(
    JSON.stringify({
      success: true,
      message: `Repository ${repoName} mis à jour avec succès`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function deleteFromGitHub(username: string, token: string, repoName: string) {
  console.log(`Suppression du repository ${repoName} sur GitHub`);
  
  const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    }
  });

  if (!response.ok && response.status !== 404) {
    throw new Error('Erreur lors de la suppression du repository GitHub');
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: `Repository ${repoName} supprimé de GitHub`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function fetchGitHubRepos(username: string, token: string): Promise<GitHubRepo[]> {
  const response = await fetch(`https://api.github.com/user/repos?per_page=100&sort=updated`, {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    }
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des repositories GitHub');
  }

  return await response.json();
}

async function fetchRepoReadme(username: string, repoName: string, token: string): Promise<string | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${username}/${repoName}/readme`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    return atob(data.content.replace(/\s/g, ''));
  } catch (error) {
    console.error(`Erreur lors de la récupération du README pour ${repoName}:`, error);
    return null;
  }
}

async function extractImageFromReadme(readme: string | null): Promise<string | null> {
  if (!readme) return null;
  
  const imageMatch = readme.match(/!\[.*?\]\((.*?)\)/);
  return imageMatch ? imageMatch[1] : null;
}

function createReadmeContent(projectData: any): string {
  return `# ${projectData.title}

${projectData.description}

## Description

${projectData.content}

## Technologies utilisées

${projectData.technologies ? projectData.technologies.map((tech: string) => `- ${tech}`).join('\n') : ''}

${projectData.demo_url ? `## Démo\n\n[Voir la démo](${projectData.demo_url})` : ''}

---

*Ce projet fait partie de mon portfolio de cybersécurité. Pour voir plus de projets, visitez [mon portfolio](https://votre-portfolio.com).*
`;
}