import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User, Share2, BookOpen, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function BlogPost() {
  const { id } = useParams();

  // Mock data - In real app, this would come from API/database
  const article = {
    id: 1,
    title: "Les Nouvelles Techniques de Phishing en 2024",
    excerpt: "Analyse des dernières méthodes utilisées par les cybercriminels pour tromper les utilisateurs et comment s'en protéger efficacement.",
    content: `Le phishing continue d'évoluer à un rythme effréné, les cybercriminels développant constamment de nouvelles techniques pour contourner les défenses traditionnelles. En 2024, nous observons plusieurs tendances inquiétantes qui nécessitent une attention particulière de la part des professionnels de la cybersécurité.

## L'IA au Service du Phishing

L'intelligence artificielle a révolutionné le phishing en permettant la création de contenus ultra-réalistes. Les deepfakes audio et vidéo sont désormais utilisés pour usurper l'identité de dirigeants d'entreprise lors d'appels téléphoniques ou de visioconférences. Ces attaques, appelées "CEO fraud" ou "fraude au président", ont causé des pertes de millions d'euros en 2024.

### Techniques Observées :
- **Clonage vocal en temps réel** : Utilisation d'IA pour reproduire la voix d'un dirigeant
- **Génération automatique d'emails** : Création de contenus personnalisés en masse
- **Deepfakes vidéo** : Fausses vidéoconférences avec des dirigeants

## Le Phishing par QR Code

Les QR codes sont devenus omniprésents depuis la pandémie, et les attaquants en profitent. Le "quishing" (QR phishing) consiste à remplacer des QR codes légitimes par des versions malveillantes redirigeant vers des sites de phishing.

### Vecteurs d'Attaque :
- Remplacement de QR codes sur des affiches publiques
- QR codes malveillants dans des emails
- Faux QR codes pour le paiement sans contact

## Phishing via les Réseaux Sociaux

Les plateformes sociales deviennent des terrains de jeu privilégiés pour les cybercriminels. Les attaques se sophistiquent avec :

- **Social media hijacking** : Prise de contrôle de comptes d'influenceurs
- **Fake contests** : Faux concours pour récupérer des données personnelles
- **Romance scams** : Arnaques sentimentales avec chantage

## Protection et Prévention

### Pour les Organisations :

1. **Formation continue** : Sensibilisation régulière des employés aux nouvelles techniques
2. **Authentification multi-facteurs** : Obligatoire sur tous les comptes sensibles
3. **Vérification en double** : Processus de validation pour les demandes financières
4. **Surveillance des réseaux sociaux** : Monitoring des mentions de l'entreprise

### Pour les Utilisateurs :

1. **Vérification systématique** : Toujours vérifier l'authenticité des demandes
2. **Méfiance envers les urgences** : Les vrais urgences sont rares
3. **Utilisation d'applications officielles** : Éviter les liens dans les emails
4. **Mise à jour régulière** : Garder tous les logiciels à jour

## Technologies de Détection

Les solutions anti-phishing évoluent également :

### Machine Learning :
- Analyse comportementale des emails
- Détection d'anomalies dans les communications
- Classification automatique des menaces

### Sandboxing :
- Analyse des liens en environnement isolé
- Détection des redirections malveillantes
- Test automatique des pièces jointes

## L'Avenir de la Lutte Anti-Phishing

La bataille contre le phishing ne fait que commencer. Avec l'émergence de nouvelles technologies comme la 5G, l'IoT et la réalité augmentée, de nouveaux vecteurs d'attaque apparaîtront. La clé réside dans l'adaptation constante de nos défenses et la formation continue de tous les utilisateurs.

## Conclusion

Le phishing reste l'une des principales menaces cybersécuritaires en 2024. Face à l'évolution constante des techniques d'attaque, il est crucial de maintenir une vigilance de tous les instants et d'adapter nos stratégies de défense. La sensibilisation et la formation restent nos meilleures armes contre ces attaques de plus en plus sophistiquées.

N'hésitez pas à partager vos expériences ou questions en commentaires. La cybersécurité est l'affaire de tous !`,
    category: "Phishing",
    tags: ["Phishing", "Social Engineering", "Prévention", "IA", "Sécurité"],
    date: "2024-03-15",
    readTime: "8 min",
    author: "CyberSecPro",
    image: "/placeholder.svg",
    relatedArticles: [
      { id: 2, title: "MITRE ATT&CK : Guide Complet pour les SOC", category: "SOC" },
      { id: 4, title: "Sécurisation des API : Vulnérabilités Communes", category: "Sécurité Web" },
      { id: 5, title: "Intelligence Artificielle et Cybersécurité", category: "IA Security" }
    ]
  };

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
          <Link to="/blog">
            <Button variant="outline" className="btn-ghost-cyber">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const shareArticle = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Toast notification would be shown here
    }
  };

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 fade-in">
          <Link to="/blog">
            <Button variant="ghost" className="mb-6 btn-ghost-cyber">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au blog
            </Button>
          </Link>
          
          {/* Article meta */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Badge variant="default">{article.category}</Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(article.date)}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              {article.readTime}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="h-4 w-4 mr-1" />
              {article.author}
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-orbitron font-bold mb-6 leading-tight">
            {article.title}
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            {article.excerpt}
          </p>

          {/* Action buttons */}
          <div className="flex gap-4 mb-8">
            <Button onClick={shareArticle} variant="outline" className="btn-ghost-cyber">
              <Share2 className="mr-2 h-4 w-4" />
              Partager
            </Button>
            <div className="flex items-center text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4 mr-2" />
              Temps de lecture : {article.readTime}
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="mb-12 fade-in fade-in-delay-1">
          <img 
            src={article.image} 
            alt={article.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg cyber-border"
          />
        </div>

        {/* Article Content */}
        <div className="fade-in fade-in-delay-2">
          <div className="prose prose-lg prose-invert max-w-none">
            {article.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={index} className="text-2xl font-orbitron font-bold mt-12 mb-6 first:mt-0">
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              } else if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={index} className="text-xl font-orbitron font-semibold mt-8 mb-4">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              } else if (paragraph.startsWith('- ')) {
                const listItems = paragraph.split('\n').filter(item => item.startsWith('- '));
                return (
                  <ul key={index} className="space-y-2 my-6">
                    {listItems.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>{item.replace('- ', '')}</span>
                      </li>
                    ))}
                  </ul>
                );
              } else if (paragraph.includes('**') && paragraph.includes(':**')) {
                const lines = paragraph.split('\n');
                return (
                  <div key={index} className="my-6">
                    {lines.map((line, lineIndex) => {
                      if (line.includes('**') && line.includes(':**')) {
                        const [bold, description] = line.split(':**');
                        return (
                          <div key={lineIndex} className="mb-3">
                            <strong className="text-primary">{bold.replace('**', '').replace('**', '')}</strong>
                            : {description}
                          </div>
                        );
                      }
                      return <div key={lineIndex} className="mb-2">{line}</div>;
                    })}
                  </div>
                );
              } else {
                return (
                  <p key={index} className="text-muted-foreground mb-6 leading-relaxed">
                    {paragraph}
                  </p>
                );
              }
            })}
          </div>
        </div>

        {/* Tags */}
        <div className="my-12 fade-in fade-in-delay-3">
          <Separator className="mb-6" />
          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm font-medium">
              <Tag className="h-4 w-4 mr-2" />
              Tags :
            </div>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Related Articles */}
        {article.relatedArticles && article.relatedArticles.length > 0 && (
          <div className="mt-16 fade-in fade-in-delay-1">
            <h2 className="text-2xl font-orbitron font-bold mb-8">
              Articles Connexes
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {article.relatedArticles.map((related) => (
                <Card key={related.id} className="cyber-border hover:cyber-glow transition-all duration-300">
                  <CardHeader>
                    <Badge variant="outline" className="w-fit mb-2">
                      {related.category}
                    </Badge>
                    <CardTitle className="text-lg">
                      <Link 
                        to={`/blog/${related.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {related.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link to={`/blog/${related.id}`}>
                      <Button variant="ghost" size="sm" className="btn-ghost-cyber">
                        Lire l'article
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 fade-in fade-in-delay-2">
          <Card className="cyber-border bg-gradient-cyber">
            <CardContent className="p-8 text-center">
              <h3 className="font-orbitron font-bold text-2xl mb-4 text-primary-foreground">
                Vous avez aimé cet article ?
              </h3>
              <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
                Découvrez d'autres analyses approfondies sur la cybersécurité 
                ou contactez-moi pour discuter de vos projets.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/blog">
                  <Button variant="secondary" className="btn-matrix">
                    Plus d'articles
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                    Me contacter
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}