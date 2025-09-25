import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Image, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileUploaderProps {
  onUpload: (url: string, type: string) => void;
  accept?: string;
  bucket: string;
  folder?: string;
  maxSizeMB?: number;
  label?: string;
  currentFile?: string;
  onRemove?: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onUpload,
  accept = "image/*,.pdf",
  bucket,
  folder = '',
  maxSizeMB = 10,
  label = "Fichier",
  currentFile,
  onRemove
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier la taille
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: `Le fichier ne doit pas dépasser ${maxSizeMB}MB`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      console.log(`Uploading to bucket: ${bucket}, path: ${filePath}`);

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      console.log('File uploaded successfully:', data.publicUrl);

      const fileType = file.type.startsWith('image/') ? 'image' : 
                      file.type === 'application/pdf' ? 'pdf' : 
                      file.type;
      
      onUpload(data.publicUrl, fileType);
      
      toast({
        title: "Fichier uploadé",
        description: `Le fichier ${file.name} a été uploadé avec succès`,
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Erreur d'upload",
        description: error.message || "Impossible d'uploader le fichier",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (url: string) => {
    if (url.toLowerCase().includes('.pdf')) {
      return <FileText className="h-4 w-4" />;
    }
    return <Image className="h-4 w-4" />;
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {currentFile ? (
        <div className="flex items-center gap-2 p-2 border rounded-lg">
          {getFileIcon(currentFile)}
          <span className="text-sm text-muted-foreground truncate flex-1">
            Fichier actuel
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.open(currentFile, '_blank')}
          >
            Voir
          </Button>
          {onRemove && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept={accept}
          onChange={handleFileUpload}
          disabled={uploading}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
        />
        {uploading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Upload className="h-4 w-4 animate-pulse" />
            Upload en cours...
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Formats acceptés: {accept}. Taille max: {maxSizeMB}MB
      </p>
    </div>
  );
};