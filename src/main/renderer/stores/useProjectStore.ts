import { create } from 'zustand';

export interface ProjectStore {
  projects: any[];
  activeProject: any | null;
  loadProjects: () => Promise<void>;
  createProject: (name: string) => Promise<void>;
  openProject: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectStore>(set => ({
  projects: [],
  activeProject: null,
  loadProjects: async () => {
    if (!window.hms) return;
    const projects = await window.hms.projects.list();
    set({ projects });
  },
  createProject: async (name: string) => {
    if (!window.hms) {
      alert('hms bridge missing'); 
      return;
    }
    try {
      const project = await window.hms.projects.create({ name });
      const list = await window.hms.projects.list();
      set({ projects: list, activeProject: project });
    } catch (error) {
      console.error('createProject failed', error);
      alert('Failed to create project: ' + (error instanceof Error ? error.message : String(error)));
    }
  },
  openProject: async (id: string) => {
    if (!window.hms) return;
    const project = await window.hms.projects.open(id);
    if (project) set({ activeProject: project });
  },
  deleteProject: async (id: string) => {
    if (!window.hms) return;
    await window.hms.projects.delete(id);
    set(state => ({
      projects: state.projects.filter(p => p.id !== id),
      activeProject: state.activeProject?.id === id ? null : state.activeProject,
    }));
  },
}));
