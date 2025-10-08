// Map project IDs to their image paths
const projectImages: Record<string, string> = {
  'b755c437-4a9b-4db1-83d2-c05f0cb00c38': '/src/assets/projects/gpo-proxy-off-lne.png',
  'a9a4f7ca-7646-4eb8-99aa-44490c3498fb': '/src/assets/projects/gpo-internet-block-lne.png',
  '251f59a3-4b95-407a-a6b6-c05b808a0349': '/src/assets/projects/pdq-optimization-lne.png',
  '431c7429-f905-4004-9581-b98c8284317c': '/src/assets/projects/ivanti-removal-lne.png',
  'fe1d1f82-6411-48fa-9394-02852ad869d2': '/src/assets/projects/veeam-restoration-lne.png',
};

export const getProjectImagePath = (projectId: string): string | null => {
  return projectImages[projectId] || null;
};

export const generateProjectPrompt = (title: string, description: string, technologies: string[]): string => {
  const techList = technologies.join(", ");
  return `Professional cybersecurity portfolio project image for "${title}". ${description}. Technologies: ${techList}. Modern dark cyber aesthetic with neon blue/purple accents, digital elements, technological feel. 16:9 aspect ratio. High quality, professional, sleek design.`;
};
