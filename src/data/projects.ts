export interface Project {
  title: string;
  description: string;
  status: string;
  year: string;
  stack: string[];
  category: string;
  outcome: string;
  href?: string;
}

export const projects: Project[] = [];
