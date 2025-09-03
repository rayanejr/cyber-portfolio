
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  slug: string;
  tags: string[];
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPost(id);
    }
  }, [id]);

  const fetchPost = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setNotFound(true);
        } else {
          throw error;
        }
      } else {
        setPost(data);
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4 sm:w-1/4 mb-6 sm:mb-8"></div>
            <div className="h-48 sm:h-64 bg-muted rounded mb-6 sm:mb-8"></div>
            <div className="h-4 bg-muted rounded w-full sm:w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-3/4 sm:w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 cyber-text">Article non trouvé</h1>
          <p className="text-muted-foreground mb-6 sm:mb-8 text-base sm:text-lg">
            L'article que vous recherchez n'existe pas ou n'est pas disponible.
          </p>
          <Button asChild className="btn-cyber">
            <Link to="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au blog
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* Back Button */}
      <Button asChild variant="ghost" className="mb-6 sm:mb-8 cyber-border">
        <Link to="/blog">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Retour au blog</span>
          <span className="sm:hidden">Retour</span>
        </Link>
      </Button>

      <div className="max-w-4xl mx-auto">
        {/* Post Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-start sm:gap-2 mb-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-orbitron cyber-text mb-2 sm:mb-0 flex-1">
              {post.title}
            </h1>
            {post.featured && (
              <Badge className="bg-primary/90 text-white self-start">
                Article vedette
              </Badge>
            )}
          </div>
          
          {post.excerpt && (
            <p className="text-lg sm:text-xl text-muted-foreground mb-4 sm:mb-6">
              {post.excerpt}
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-muted-foreground mb-6 sm:mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-xs sm:text-sm">
                {new Date(post.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-xs sm:text-sm">5 min de lecture</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Expert Cybersécurité</span>
            </div>
          </div>
        </div>

        {/* Post Image */}
        {post.image_url && (
          <div className="mb-8 sm:mb-12">
            <img 
              src={post.image_url} 
              alt={post.title}
              className="w-full rounded-lg shadow-lg cyber-border"
            />
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <h3 className="text-lg font-semibold mb-3 sm:mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs sm:text-sm cyber-border">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Post Content */}
        <Card className="cyber-border">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              {post.content.split('\n').map((paragraph, index) => (
                paragraph.trim() ? (
                  <p key={index} className="mb-4 text-sm sm:text-base leading-relaxed">
                    {paragraph}
                  </p>
                ) : null
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Back to Blog */}
        <div className="text-center mt-8 sm:mt-12">
          <Button asChild variant="outline" className="cyber-border">
            <Link to="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Retour au blog</span>
              <span className="sm:hidden">Retour</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
