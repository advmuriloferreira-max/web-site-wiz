import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useRealtimeQuery } from './useRealtimeQuery';
import { useToast } from './use-toast';

export interface WorkspaceConfig {
  id: string;
  user_id: string;
  name: string;
  type: 'personal' | 'team' | 'template';
  description?: string;
  config: Record<string, any>;
  is_default: boolean;
  is_active: boolean;
  shared_with: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardLayout {
  id: string;
  workspace_id: string;
  user_id: string;
  name: string;
  layout: any[];
  widgets: Record<string, any>;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  layout_density: 'compact' | 'comfortable' | 'spacious';
  sidebar_width: number;
  font_scale: number;
  color_theme: Record<string, any>;
  interface_config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceTemplate {
  id: string;
  name: string;
  description?: string;
  role: string;
  config: Record<string, any>;
  layout: any[];
  widgets: Record<string, any>;
  is_public: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export function useWorkspace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceConfig | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  // Real-time workspace configs
  const [workspaces, setWorkspaces] = useState<WorkspaceConfig[]>([]);
  const [dashboardLayouts, setDashboardLayouts] = useState<DashboardLayout[]>([]);
  const [templates, setTemplates] = useState<WorkspaceTemplate[]>([]);
  const [workspacesLoading, setWorkspacesLoading] = useState(false);

  // Load workspaces
  useEffect(() => {
    if (!user?.id) return;

    const loadWorkspaces = async () => {
      setWorkspacesLoading(true);
      try {
        const { data, error } = await supabase
          .from('workspace_configs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setWorkspaces(data as WorkspaceConfig[] || []);
      } catch (error) {
        console.error('Error loading workspaces:', error);
      }
      setWorkspacesLoading(false);
    };

    loadWorkspaces();
  }, [user?.id]);

  // Load dashboard layouts
  useEffect(() => {
    if (!user?.id) return;

    const loadLayouts = async () => {
      try {
        const { data, error } = await supabase
          .from('dashboard_layouts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDashboardLayouts(data as DashboardLayout[] || []);
      } catch (error) {
        console.error('Error loading layouts:', error);
      }
    };

    loadLayouts();
  }, [user?.id]);

  // Load templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const { data, error } = await supabase
          .from('workspace_templates')
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTemplates(data as WorkspaceTemplate[] || []);
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    };

    loadTemplates();
  }, []);

  // Load user preferences
  useEffect(() => {
    if (!user?.id) return;

    const loadPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setUserPreferences(data as UserPreferences);
        } else {
          // Create default preferences
          const defaultPrefs = {
            user_id: user.id,
            layout_density: 'comfortable' as const,
            sidebar_width: 280,
            font_scale: 1.0,
            color_theme: {},
            interface_config: {}
          };

          const { data: newPrefs, error: createError } = await supabase
            .from('user_preferences')
            .insert(defaultPrefs)
            .select()
            .single();

          if (createError) throw createError;
          setUserPreferences(newPrefs as UserPreferences);
        }
      } catch (error: any) {
        console.error('Error loading preferences:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar preferências do usuário",
          variant: "destructive"
        });
      }
    };

    loadPreferences();
  }, [user?.id, toast]);

  // Set active workspace
  useEffect(() => {
    if (workspaces.length > 0 && !activeWorkspace) {
      const active = workspaces.find(w => w.is_active) || workspaces[0];
      setActiveWorkspace(active);
    }
    setLoading(false);
  }, [workspaces, activeWorkspace]);

  const createWorkspace = useCallback(async (workspace: Omit<WorkspaceConfig, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('workspace_configs')
        .insert({
          ...workspace,
          user_id: user.id,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Workspace criado com sucesso"
      });

      return data;
    } catch (error: any) {
      console.error('Error creating workspace:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar workspace",
        variant: "destructive"
      });
      return null;
    }
  }, [user?.id, toast]);

  const updateWorkspace = useCallback(async (id: string, updates: Partial<WorkspaceConfig>) => {
    try {
      const { data, error } = await supabase
        .from('workspace_configs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (updates.is_active) {
        // Deactivate other workspaces
        await supabase
          .from('workspace_configs')
          .update({ is_active: false })
          .neq('id', id)
          .eq('user_id', user?.id);
      }

      toast({
        title: "Sucesso",
        description: "Workspace atualizado com sucesso"
      });

      return data;
    } catch (error: any) {
      console.error('Error updating workspace:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar workspace",
        variant: "destructive"
      });
      return null;
    }
  }, [user?.id, toast]);

  const deleteWorkspace = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('workspace_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Workspace excluído com sucesso"
      });

      // If deleted workspace was active, set another as active
      if (activeWorkspace?.id === id) {
        const remaining = workspaces.filter(w => w.id !== id);
        if (remaining.length > 0) {
          await updateWorkspace(remaining[0].id, { is_active: true });
        }
      }
    } catch (error: any) {
      console.error('Error deleting workspace:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir workspace",
        variant: "destructive"
      });
    }
  }, [activeWorkspace, workspaces, updateWorkspace, toast]);

  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    if (!user?.id || !userPreferences) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setUserPreferences(data as UserPreferences);
      
      toast({
        title: "Sucesso",
        description: "Preferências atualizadas com sucesso"
      });
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar preferências",
        variant: "destructive"
      });
    }
  }, [user?.id, userPreferences, toast]);

  const saveDashboardLayout = useCallback(async (
    workspaceId: string,
    name: string,
    layout: any[],
    widgets: Record<string, any>
  ) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('dashboard_layouts')
        .upsert({
          workspace_id: workspaceId,
          user_id: user.id,
          name,
          layout,
          widgets
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Layout do dashboard salvo com sucesso"
      });

      return data;
    } catch (error: any) {
      console.error('Error saving dashboard layout:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar layout do dashboard",
        variant: "destructive"
      });
      return null;
    }
  }, [user?.id, toast]);

  const shareWorkspace = useCallback(async (id: string, userEmails: string[]) => {
    try {
      const { data, error } = await supabase
        .from('workspace_configs')
        .update({ shared_with: userEmails })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Workspace compartilhado com sucesso"
      });

      return data;
    } catch (error: any) {
      console.error('Error sharing workspace:', error);
      toast({
        title: "Erro",
        description: "Erro ao compartilhar workspace",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  const exportWorkspace = useCallback(async (id: string) => {
    try {
      const workspace = workspaces.find(w => w.id === id);
      const layouts = dashboardLayouts.filter(l => l.workspace_id === id);

      if (!workspace) throw new Error('Workspace não encontrado');

      const exportData = {
        workspace: {
          name: workspace.name,
          description: workspace.description,
          config: workspace.config
        },
        layouts,
        preferences: userPreferences,
        exportedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workspace-${workspace.name}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Sucesso",
        description: "Workspace exportado com sucesso"
      });
    } catch (error: any) {
      console.error('Error exporting workspace:', error);
      toast({
        title: "Erro",
        description: "Erro ao exportar workspace",
        variant: "destructive"
      });
    }
  }, [workspaces, dashboardLayouts, userPreferences, toast]);

  const importWorkspace = useCallback(async (file: File) => {
    if (!user?.id) return;

    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      // Create workspace
      const newWorkspace = await createWorkspace({
        name: `${importData.workspace.name} (Importado)`,
        description: importData.workspace.description,
        config: importData.workspace.config,
        type: 'personal',
        is_default: false,
        is_active: false,
        shared_with: []
      });

      if (!newWorkspace) throw new Error('Erro ao criar workspace');

      // Import layouts
      for (const layout of importData.layouts || []) {
        await saveDashboardLayout(
          newWorkspace.id,
          layout.name,
          layout.layout,
          layout.widgets
        );
      }

      toast({
        title: "Sucesso",
        description: "Workspace importado com sucesso"
      });
    } catch (error: any) {
      console.error('Error importing workspace:', error);
      toast({
        title: "Erro",
        description: "Erro ao importar workspace",
        variant: "destructive"
      });
    }
  }, [user?.id, createWorkspace, saveDashboardLayout, toast]);

  return {
    // Data
    workspaces,
    dashboardLayouts,
    templates,
    activeWorkspace,
    userPreferences,
    loading: loading || workspacesLoading,

    // Actions
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    updatePreferences,
    saveDashboardLayout,
    shareWorkspace,
    exportWorkspace,
    importWorkspace,
    setActiveWorkspace
  };
}