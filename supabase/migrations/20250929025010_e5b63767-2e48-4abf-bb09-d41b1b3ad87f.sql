-- Create table for workspace configurations
CREATE TABLE public.workspace_configs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'personal', -- 'personal', 'team', 'template'
  description text,
  config jsonb NOT NULL DEFAULT '{}',
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT false,
  shared_with text[] DEFAULT '{}',
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for dashboard layouts
CREATE TABLE public.dashboard_layouts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid REFERENCES public.workspace_configs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Dashboard',
  layout jsonb NOT NULL DEFAULT '[]',
  widgets jsonb NOT NULL DEFAULT '{}',
  is_default boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for user preferences
CREATE TABLE public.user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  layout_density text DEFAULT 'comfortable', -- 'compact', 'comfortable', 'spacious'
  sidebar_width integer DEFAULT 280,
  font_scale numeric DEFAULT 1.0,
  color_theme jsonb DEFAULT '{}',
  interface_config jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for workspace templates
CREATE TABLE public.workspace_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  role text NOT NULL, -- 'advogado', 'gerente', 'assistente'
  config jsonb NOT NULL DEFAULT '{}',
  layout jsonb NOT NULL DEFAULT '[]',
  widgets jsonb NOT NULL DEFAULT '{}',
  is_public boolean DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workspace_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workspace_configs
CREATE POLICY "Users can view their own workspace configs"
ON public.workspace_configs
FOR SELECT
USING (
  auth.uid() = user_id 
  OR auth.uid()::text = ANY(shared_with)
  OR type = 'template'
);

CREATE POLICY "Users can create their own workspace configs"
ON public.workspace_configs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workspace configs"
ON public.workspace_configs
FOR UPDATE
USING (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY "Users can delete their own workspace configs"
ON public.workspace_configs
FOR DELETE
USING (auth.uid() = user_id OR auth.uid() = created_by);

-- RLS Policies for dashboard_layouts
CREATE POLICY "Users can view their dashboard layouts"
ON public.dashboard_layouts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their dashboard layouts"
ON public.dashboard_layouts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their dashboard layouts"
ON public.dashboard_layouts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their dashboard layouts"
ON public.dashboard_layouts
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences"
ON public.user_preferences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences"
ON public.user_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.user_preferences
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for workspace_templates
CREATE POLICY "Everyone can view public templates"
ON public.workspace_templates
FOR SELECT
USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Authenticated users can create templates"
ON public.workspace_templates
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates"
ON public.workspace_templates
FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own templates"
ON public.workspace_templates
FOR DELETE
USING (auth.uid() = created_by);

-- Create triggers for updated_at
CREATE TRIGGER update_workspace_configs_updated_at
BEFORE UPDATE ON public.workspace_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboard_layouts_updated_at
BEFORE UPDATE ON public.dashboard_layouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspace_templates_updated_at
BEFORE UPDATE ON public.workspace_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for all tables
ALTER TABLE public.workspace_configs REPLICA IDENTITY FULL;
ALTER TABLE public.dashboard_layouts REPLICA IDENTITY FULL;
ALTER TABLE public.user_preferences REPLICA IDENTITY FULL;
ALTER TABLE public.workspace_templates REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_configs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dashboard_layouts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_preferences;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_templates;