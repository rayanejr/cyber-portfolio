import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VeilleSource {
  id: string;
  name: string;
  url: string;
  type: string;
  config: any;
  keywords: string[];
  is_active: boolean;
  last_sync: string | null;
}

interface VeilleItem {
  title: string;
  url: string;
  content?: string;
  excerpt?: string;
  source: string;
  category: string;
  keywords: string[];
  severity?: string;
  cve_id?: string;
  published_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting veille import process...');

    // Récupérer les sources actives
    const { data: sources, error: sourcesError } = await supabase
      .from('veille_sources')
      .select('*')
      .eq('is_active', true);

    if (sourcesError) {
      console.error('Error fetching sources:', sourcesError);
      throw sourcesError;
    }

    console.log(`Found ${sources?.length || 0} active sources`);

    let totalImported = 0;
    const newItems: VeilleItem[] = [];

    for (const source of sources || []) {
      console.log(`Processing source: ${source.name}`);
      
      try {
        const items = await processSource(source);
        console.log(`Processed ${items.length} items from ${source.name}`);
        
        for (const item of items) {
          // Vérifier si l'item existe déjà
          const { data: existing } = await supabase
            .from('veille_techno')
            .select('id')
            .eq('url', item.url)
            .single();

          if (!existing) {
            newItems.push(item);
          }
        }

        // Mettre à jour last_sync
        await supabase
          .from('veille_sources')
          .update({ last_sync: new Date().toISOString() })
          .eq('id', source.id);

      } catch (error) {
        console.error(`Error processing source ${source.name}:`, error);
        // Continuer avec les autres sources
      }
    }

    // Insérer les nouveaux items
    if (newItems.length > 0) {
      const { error: insertError } = await supabase
        .from('veille_techno')
        .insert(newItems);

      if (insertError) {
        console.error('Error inserting items:', insertError);
        throw insertError;
      }

      totalImported = newItems.length;
      console.log(`Successfully imported ${totalImported} new items`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        imported: totalImported,
        sources_processed: sources?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in veille-import function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function processSource(source: VeilleSource): Promise<VeilleItem[]> {
  const items: VeilleItem[] = [];

  try {
    if (source.type === 'rss') {
      return await processRSSFeed(source);
    } else if (source.type === 'api') {
      return await processAPISource(source);
    }
  } catch (error) {
    console.error(`Error processing source ${source.name}:`, error);
  }

  return items;
}

async function processRSSFeed(source: VeilleSource): Promise<VeilleItem[]> {
  const items: VeilleItem[] = [];
  
  try {
    const feedUrl = source.config?.feed_url || source.url;
    console.log(`Fetching RSS feed: ${feedUrl}`);
    
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VeilleTechno/1.0)',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const xmlText = await response.text();
    
    // Parser XML basique pour extraire les items
    const itemMatches = xmlText.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
    
    for (const itemXml of itemMatches.slice(0, 10)) { // Limiter à 10 items par source
      try {
        const title = extractXMLContent(itemXml, 'title') || 'Sans titre';
        const link = extractXMLContent(itemXml, 'link') || extractXMLContent(itemXml, 'guid') || '';
        const description = extractXMLContent(itemXml, 'description') || '';
        const pubDate = extractXMLContent(itemXml, 'pubDate') || new Date().toISOString();
        
        if (!link || !title) continue;
        
        // Nettoyer la description HTML
        const cleanDescription = description.replace(/<[^>]*>/g, '').substring(0, 500);
        
        // Détecter les mots-clés
        const detectedKeywords = detectKeywords(title + ' ' + cleanDescription, source.keywords);
        
        if (detectedKeywords.length === 0) continue; // Ignorer si aucun mot-clé détecté
        
        // Catégoriser automatiquement
        const category = categorizeItem(title, cleanDescription, detectedKeywords);
        
        // Détecter CVE
        const cveMatch = (title + ' ' + cleanDescription).match(/CVE-\d{4}-\d{4,}/i);
        const cveId = cveMatch ? cveMatch[0].toUpperCase() : undefined;
        
        // Détecter sévérité
        const severity = detectSeverity(title, cleanDescription);
        
        items.push({
          title: title.substring(0, 255),
          url: link,
          content: cleanDescription,
          excerpt: cleanDescription.substring(0, 200),
          source: source.name,
          category,
          keywords: detectedKeywords,
          severity,
          cve_id: cveId,
          published_at: parseDate(pubDate),
        });
        
      } catch (error) {
        console.error('Error parsing RSS item:', error);
      }
    }
    
  } catch (error) {
    console.error(`Error processing RSS feed ${source.name}:`, error);
  }
  
  return items;
}

async function processAPISource(source: VeilleSource): Promise<VeilleItem[]> {
  const items: VeilleItem[] = [];
  
  try {
    if (source.name === 'NVD CVE') {
      return await processNVDAPI(source);
    } else if (source.name === 'CISA KEV') {
      return await processCISAAPI(source);
    }
  } catch (error) {
    console.error(`Error processing API source ${source.name}:`, error);
  }
  
  return items;
}

async function processNVDAPI(source: VeilleSource): Promise<VeilleItem[]> {
  const items: VeilleItem[] = [];
  
  try {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 jours
    
    const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?pubStartDate=${startDate.toISOString()}&pubEndDate=${endDate.toISOString()}&resultsPerPage=20`;
    
    console.log(`Fetching NVD API: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VeilleTechno/1.0)',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    for (const vuln of data.vulnerabilities || []) {
      try {
        const cve = vuln.cve;
        const cveId = cve.id;
        const description = cve.descriptions?.find((d: any) => d.lang === 'en')?.value || '';
        
        // Détecter les mots-clés
        const detectedKeywords = detectKeywords(description, source.keywords);
        if (detectedKeywords.length === 0) continue;
        
        // Déterminer la sévérité
        let severity = 'Unknown';
        const cvssV3 = cve.metrics?.cvssMetricV31?.[0] || cve.metrics?.cvssMetricV30?.[0];
        if (cvssV3) {
          const score = cvssV3.cvssData.baseScore;
          if (score >= 9.0) severity = 'Critical';
          else if (score >= 7.0) severity = 'High';
          else if (score >= 4.0) severity = 'Medium';
          else severity = 'Low';
        }
        
        items.push({
          title: `${cveId}: ${description.substring(0, 100)}...`,
          url: `https://nvd.nist.gov/vuln/detail/${cveId}`,
          content: description,
          excerpt: description.substring(0, 200),
          source: source.name,
          category: 'Vulnérabilités',
          keywords: detectedKeywords,
          severity,
          cve_id: cveId,
          published_at: cve.published || new Date().toISOString(),
        });
        
      } catch (error) {
        console.error('Error parsing NVD item:', error);
      }
    }
    
  } catch (error) {
    console.error('Error processing NVD API:', error);
  }
  
  return items;
}

async function processCISAAPI(source: VeilleSource): Promise<VeilleItem[]> {
  const items: VeilleItem[] = [];
  
  try {
    const response = await fetch('https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Prendre seulement les 10 plus récents
    const recentVulns = data.vulnerabilities
      ?.sort((a: any, b: any) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
      ?.slice(0, 10) || [];
    
    for (const vuln of recentVulns) {
      try {
        const description = `${vuln.vulnerabilityName}: ${vuln.shortDescription}`;
        
        // Détecter les mots-clés
        const detectedKeywords = detectKeywords(description, source.keywords);
        if (detectedKeywords.length === 0) continue;
        
        items.push({
          title: `CISA KEV: ${vuln.cveID} - ${vuln.vulnerabilityName}`,
          url: `https://nvd.nist.gov/vuln/detail/${vuln.cveID}`,
          content: `${vuln.shortDescription}\n\nProduit: ${vuln.product}\nFournisseur: ${vuln.vendorProject}\nAction requise: ${vuln.requiredAction}`,
          excerpt: vuln.shortDescription,
          source: source.name,
          category: 'Exploits/PoC',
          keywords: detectedKeywords,
          severity: 'Critical', // KEV sont par définition critiques
          cve_id: vuln.cveID,
          published_at: vuln.dateAdded,
        });
        
      } catch (error) {
        console.error('Error parsing CISA item:', error);
      }
    }
    
  } catch (error) {
    console.error('Error processing CISA API:', error);
  }
  
  return items;
}

function extractXMLContent(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

function detectKeywords(text: string, keywords: string[]): string[] {
  const detected: string[] = [];
  const lowerText = text.toLowerCase();
  
  for (const keyword of keywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      detected.push(keyword);
    }
  }
  
  return detected;
}

function categorizeItem(title: string, content: string, keywords: string[]): string {
  const text = (title + ' ' + content).toLowerCase();
  
  if (text.includes('cve-') || text.includes('vulnerability') || text.includes('vuln')) {
    return 'Vulnérabilités';
  }
  if (text.includes('exploit') || text.includes('poc') || text.includes('proof of concept')) {
    return 'Exploits/PoC';
  }
  if (text.includes('advisory') || text.includes('security bulletin') || text.includes('patch')) {
    return 'Advisories';
  }
  if (text.includes('malware') || text.includes('ransomware') || text.includes('threat')) {
    return 'Malware/Threat';
  }
  if (text.includes('aws') || text.includes('azure') || text.includes('cloud') || text.includes('kubernetes')) {
    return 'Cloud/Infra';
  }
  if (text.includes('detection') || text.includes('defense') || text.includes('incident response')) {
    return 'Blue Team';
  }
  if (text.includes('tool') || text.includes('script') || text.includes('automation')) {
    return 'Outils';
  }
  
  return 'Lecture longue';
}

function detectSeverity(title: string, content: string): string | undefined {
  const text = (title + ' ' + content).toLowerCase();
  
  if (text.includes('critical') || text.includes('zero-day') || text.includes('0-day')) {
    return 'Critical';
  }
  if (text.includes('high') || text.includes('severe')) {
    return 'High';
  }
  if (text.includes('medium') || text.includes('moderate')) {
    return 'Medium';
  }
  if (text.includes('low') || text.includes('minor')) {
    return 'Low';
  }
  
  return undefined;
}

function parseDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return new Date().toISOString();
    }
    return date.toISOString();
  } catch {
    return new Date().toISOString();
  }
}