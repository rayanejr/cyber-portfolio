import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, ExternalLink, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CertificationViewerProps {
  isOpen: boolean;
  onClose: () => void;
  certification: {
    name: string;
    issuer?: string;
    issue_date?: string;
    expiry_date?: string | null;
    pdf_url?: string | null;
    image_url?: string | null;
    credential_url?: string | null;
  } | null;
}

export default function CertificationViewer({ isOpen, onClose, certification }: CertificationViewerProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && certification) {
      generateSignedUrl();
    } else {
      setSignedUrl(null);
    }
  }, [isOpen, certification]);

  const generateSignedUrl = async () => {
    if (!certification) return;
    
    const fileUrl = certification.pdf_url || certification.image_url;
    if (!fileUrl) return;

    try {
      setLoading(true);
      // Check if it's from admin-files bucket (private)
      if (fileUrl.includes('admin-files') || !fileUrl.startsWith('http')) {
        const fileName = fileUrl.includes('/') ? fileUrl.split('/').pop() : fileUrl;
        const { data, error } = await supabase.storage
          .from('admin-files')
          .createSignedUrl(fileName!, 300); // 5 minutes

        if (error) {
          console.error('Error creating signed URL:', error);
          setSignedUrl(fileUrl); // Fallback
        } else {
          setSignedUrl(data.signedUrl);
        }
      } else {
        setSignedUrl(fileUrl); // Public URL
      }
    } catch (error) {
      console.error('Error generating signed URL:', error);
      setSignedUrl(fileUrl); // Fallback
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async () => {
    if (!certification) return;
    
    const fileUrl = certification.pdf_url || certification.image_url;
    if (!fileUrl) return;

    try {
      // Generate fresh signed URL for download
      if (fileUrl.includes('admin-files') || !fileUrl.startsWith('http')) {
        const fileName = fileUrl.includes('/') ? fileUrl.split('/').pop() : fileUrl;
        const { data, error } = await supabase.storage
          .from('admin-files')
          .createSignedUrl(fileName!, 60);

        if (error) {
          throw error;
        }
        
        window.open(data.signedUrl, '_blank');
      } else {
        window.open(fileUrl, '_blank');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de télécharger le fichier.",
        variant: "destructive"
      });
    }
  };

  if (!certification) return null;

  const isPdf = certification.pdf_url && certification.pdf_url.toLowerCase().includes('.pdf');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">{certification.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                {certification.issuer && (
                  <Badge variant="outline">{certification.issuer}</Badge>
                )}
                {certification.issue_date && (
                  <Badge variant="secondary">
                    {new Date(certification.issue_date).getFullYear()}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : signedUrl ? (
            <div className="h-full flex flex-col">
              {isPdf ? (
                <iframe
                  src={signedUrl}
                  className="flex-1 w-full border rounded-md"
                  title={`${certification.name} - ${certification.issuer}`}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <img
                    src={signedUrl}
                    alt={`${certification.name} - ${certification.issuer}`}
                    className="max-w-full max-h-full object-contain rounded-md"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <p className="text-muted-foreground text-center">
                Aucun fichier disponible pour cette certification.
              </p>
              {certification.credential_url && (
                <Button asChild variant="outline">
                  <a
                    href={certification.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Voir la certification en ligne
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>

        {signedUrl && (
          <div className="flex gap-2 pt-4 border-t flex-shrink-0">
            <Button onClick={downloadFile} variant="default" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Télécharger
            </Button>
            {certification.credential_url && (
              <Button asChild variant="outline">
                <a
                  href={certification.credential_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Vérifier en ligne
                </a>
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}