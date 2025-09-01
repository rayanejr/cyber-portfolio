
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
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-muted rounded mb-8"></div>
            <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="container mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Article non trouvé</h1>
          <p className="text-muted-foreground mb-8">
            L'article que vous recherchez n'existe pas ou n'est pas disponible.
          </p>
          <Button asChild>
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
    <div className="container mx-auto px-6 py-20">
      {/* Back Button */}
      <Button asChild variant="ghost" className="mb-8">
        <Link to="/blog">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au blog
        </Link>
      </Button>

      <div className="max-w-4xl mx-auto">
        {/* Post Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold font-orbitron text-gradient">
              {post.title}
            </h1>
            {post.featured && (
              <Badge className="bg-primary/90 text-white">
                Article vedette
              </Badge>
            )}
          </div>
          
          {post.excerpt && (
            <p className="text-xl text-muted-foreground mb-6">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(post.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              5 min de lecture
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Expert Cybersécurité
            </div>
          </div>
        </div>

        {/* Post Image */}
        {post.image_url && (
          <div className="mb-12">
            <img 
              src={post.image_url} 
              alt={post.title}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-semibold mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Post Content */}
        <Card>
          <CardContent className="p-8">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              {post.content.split('\n').map((paragraph, index) => (
                paragraph.trim() ? (
                  <p key={index} className="mb-4 text-base leading-relaxed">
                    {paragraph}
                  </p>
                ) : null
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Back to Blog */}
        <div className="text-center mt-12">
          <Button asChild variant="outline">
            <Link to="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au blog
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
