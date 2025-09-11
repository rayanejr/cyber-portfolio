import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function CVDownloadButton() {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchResume = async () => {
      const { data, error } = await supabase
        .from("admin_files")
        .select("file_url")
        .eq("file_category", "cv")
        .eq("is_active", true)
        .single();

      if (!error && data) setResumeUrl(data.file_url);
    };

    fetchResume();
  }, []);

  if (!resumeUrl) return null;

  return (
    <a
      href={resumeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full sm:w-auto"
    >
      <Button size="lg" className="btn-cyber group w-full sm:w-auto">
        Télécharger mon CV
        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
      </Button>
    </a>
  );
}
