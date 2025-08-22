import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, X } from "lucide-react";

interface CertificationViewerProps {
  isOpen: boolean;
  onClose: () => void;
  certification: {
    name: string;
    issuer: string;
    pdf_url?: string;
    image_url?: string;
    credential_url?: string;
  } | null;
}

export default function CertificationViewer({ isOpen, onClose, certification }: CertificationViewerProps) {
  if (!certification) return null;

  const downloadFile = () => {
    if (certification.pdf_url) {
      const link = document.createElement('a');
      link.href = certification.pdf_url;
      link.download = `${certification.name}_certification.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] cyber-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-orbitron">
              {certification.name} - {certification.issuer}
            </DialogTitle>
            <div className="flex gap-2">
              {certification.pdf_url && (
                <Button
                  size="sm"
                  onClick={downloadFile}
                  className="btn-ghost-cyber"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              )}
              {certification.credential_url && (
                <Button
                  size="sm"
                  onClick={() => window.open(certification.credential_url, '_blank')}
                  className="btn-ghost-cyber"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Vérifier
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          {certification.pdf_url ? (
            <iframe
              src={certification.pdf_url}
              className="w-full h-[70vh] rounded-lg"
              title={`${certification.name} Certificate`}
            />
          ) : certification.image_url ? (
            <div className="flex justify-center">
              <img
                src={certification.image_url}
                alt={`${certification.name} Certificate`}
                className="max-w-full max-h-[70vh] object-contain rounded-lg cyber-border"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <p className="mb-4">Aperçu de la certification non disponible</p>
                {certification.credential_url && (
                  <Button
                    onClick={() => window.open(certification.credential_url, '_blank')}
                    className="btn-cyber"
                  >
                    Voir en ligne
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}