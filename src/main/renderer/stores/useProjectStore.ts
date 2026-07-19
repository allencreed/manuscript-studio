import { create } from 'zustand';

export interface ProjectStore {
  projects: any[];
  activeProject: any | null;
  loadProjects: () => Promise<void>;
  createProject: (name: string) => Promise<any>;
  openProject: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  activeProject: null,
  loadProjects: async () => {
    try {
      if (!window.hms) throw new Error('hms bridge missing');
      const projects = await window.hms.projects.list();
      set({ projects: Array.isArray(projects) ? projects : [] });
    } catch (error) {
      console.error('loadProjects failed', error);
      set({ projects: [] });
    }
  },
  createProject: async (name: string) => {
    try {
      if (!window.hms) throw new Error('hms bridge missing');
      const project = await window.hms.projects.create({ name });
      const list = await window.hms.projects.list();
      set({ projects: Array.isArray(list) ? list : [], activeProject: project });
      return project;
    } catch (error) {
      console.error('createProject failed', error);
      throw error;
    }
  },
  openProject: async (id: string) => {
    try {
      if (!window.hms) throw new Error('hms bridge missing');
      const project = await window.hms.projects.open(id);
      if (project) set({ activeProject: project });
    } catch (error) {
      console.error('openProject failed', error);
    }
  },
  deleteProject: async (id: string) => {
    try {
      if (!window.hms) throw new Error('hms bridge missing');
      await window.hms.projects.delete(id);
      set(state => ({
        projects: state.projects.filter(p => p.id !== id),
        activeProject: state.activeProject?.id === id ? null : state.activeProject,
      }));
    } catch (error) {
      console.error('deleteProject failed', error);
    }
  },
  uncreate: async (name: string) => {
    const project = { id: crypto.randomUUID?.() || String(Date.now()), name, createdAt: Date.now() };
    set(state => ({
      projects: [...state.projects, project],
      activeProject: project,
    }));
    return project;
  },
  deleteAllProjects: () => set({ projects: [], activeProject: null }),
  renameProject: (_id: string, _name: string) => set(state => ({
    projects: state.projects.map(p => p.id === _id ? { ...p, name: _name } : p),
  })),
  clearActiveProject: () => set({ activeProject: null }),
}));
