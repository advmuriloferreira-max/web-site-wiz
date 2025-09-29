import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useAuth } from '@/hooks/useAuth';
import { 
  Settings,
  Palette,
  Layout,
  Share,
  Download,
  Upload,
  Users,
  Trash2,
  Copy,
  Eye,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';

export function WorkspaceSettings() {
  const { user } = useAuth();
  const {
    activeWorkspace,
    userPreferences,
    workspaces,
    templates,
    updateWorkspace,
    updatePreferences,
    shareWorkspace,
    exportWorkspace,
    importWorkspace,
    createWorkspace,
    deleteWorkspace
  } = useWorkspace();

  const [shareEmails, setShareEmails] = useState<string[]>([]);
  const [newShareEmail, setNewShareEmail] = useState('');
  const [workspaceName, setWorkspaceName] = useState(activeWorkspace?.name || '');
  const [workspaceDescription, setWorkspaceDescription] = useState(activeWorkspace?.description || '');

  const handleSaveWorkspace = async () => {
    if (!activeWorkspace) return;

    await updateWorkspace(activeWorkspace.id, {
      name: workspaceName,
      description: workspaceDescription
    });
  };

  const handleDensityChange = async (density: 'compact' | 'comfortable' | 'spacious') => {
    await updatePreferences({ layout_density: density });
  };

  const handleSidebarWidthChange = async (width: number[]) => {
    await updatePreferences({ sidebar_width: width[0] });
  };

  const handleFontScaleChange = async (scale: number[]) => {
    await updatePreferences({ font_scale: scale[0] });
  };

  const addShareEmail = () => {
    if (newShareEmail && !shareEmails.includes(newShareEmail)) {
      setShareEmails([...shareEmails, newShareEmail]);
      setNewShareEmail('');
    }
  };

  const removeShareEmail = (email: string) => {
    setShareEmails(shareEmails.filter(e => e !== email));
  };

  const handleShareWorkspace = async () => {
    if (!activeWorkspace || shareEmails.length === 0) return;
    await shareWorkspace(activeWorkspace.id, shareEmails);
    setShareEmails([]);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importWorkspace(file);
    }
  };

  const createFromTemplate = async (template: any) => {
    await createWorkspace({
      name: `${template.name} - ${user?.email}`,
      description: template.description,
      config: template.config,
      type: 'personal',
      is_default: false,
      is_active: false,
      shared_with: []
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5" />
        <h2 className="text-2xl font-bold">Configurações do Workspace</h2>
      </div>

      <Tabs defaultValue="workspace" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="sharing">Compartilhar</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Workspace Settings */}
        <TabsContent value="workspace" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                Configurações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Nome do Workspace</Label>
                <Input
                  id="workspace-name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Meu Workspace"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workspace-description">Descrição</Label>
                <Textarea
                  id="workspace-description"
                  value={workspaceDescription}
                  onChange={(e) => setWorkspaceDescription(e.target.value)}
                  placeholder="Descrição do workspace..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveWorkspace}>
                  Salvar Alterações
                </Button>
                <Button
                  variant="outline"
                  onClick={() => activeWorkspace && exportWorkspace(activeWorkspace.id)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <div className="relative">
                  <Button variant="outline" className="relative overflow-hidden">
                    <Upload className="h-4 w-4 mr-2" />
                    Importar
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workspaces Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.isArray(workspaces) && workspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{workspace.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {workspace.description}
                        </p>
                      </div>
                      {workspace.is_active && (
                        <Badge variant="default">Ativo</Badge>
                      )}
                      {workspace.type === 'team' && (
                        <Badge variant="secondary">Equipe</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateWorkspace(workspace.id, { is_active: true })}
                        disabled={workspace.is_active}
                      >
                        {workspace.is_active ? 'Ativo' : 'Ativar'}
                      </Button>
                      {!workspace.is_active && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteWorkspace(workspace.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout Preferences */}
        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Preferências de Layout
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Densidade da Interface</Label>
                <div className="flex gap-2">
                  {(['compact', 'comfortable', 'spacious'] as const).map((density) => (
                    <Button
                      key={density}
                      variant={userPreferences?.layout_density === density ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleDensityChange(density)}
                      className="capitalize"
                    >
                      {density === 'compact' && <Smartphone className="h-4 w-4 mr-2" />}
                      {density === 'comfortable' && <Tablet className="h-4 w-4 mr-2" />}
                      {density === 'spacious' && <Monitor className="h-4 w-4 mr-2" />}
                      {density === 'compact' ? 'Compacto' : 
                       density === 'comfortable' ? 'Confortável' : 'Espaçoso'}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Largura da Sidebar ({userPreferences?.sidebar_width}px)</Label>
                <Slider
                  value={[userPreferences?.sidebar_width || 280]}
                  onValueChange={handleSidebarWidthChange}
                  min={200}
                  max={400}
                  step={20}
                  className="w-full"
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Escala da Fonte ({((userPreferences?.font_scale || 1) * 100).toFixed(0)}%)</Label>
                <Slider
                  value={[userPreferences?.font_scale || 1]}
                  onValueChange={handleFontScaleChange}
                  min={0.8}
                  max={1.4}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sharing */}
        <TabsContent value="sharing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share className="h-4 w-4" />
                Compartilhar Workspace
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Adicionar usuários por email</Label>
                <div className="flex gap-2">
                  <Input
                    value={newShareEmail}
                    onChange={(e) => setNewShareEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addShareEmail();
                      }
                    }}
                  />
                  <Button onClick={addShareEmail}>Adicionar</Button>
                </div>
              </div>

              {shareEmails.length > 0 && (
                <div className="space-y-2">
                  <Label>Usuários para compartilhar:</Label>
                  <div className="flex flex-wrap gap-2">
                    {shareEmails.map((email) => (
                      <Badge key={email} variant="secondary" className="gap-2">
                        {email}
                        <button
                          onClick={() => removeShareEmail(email)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Button onClick={handleShareWorkspace}>
                    <Users className="h-4 w-4 mr-2" />
                    Compartilhar Workspace
                  </Button>
                </div>
              )}

              {activeWorkspace?.shared_with?.length > 0 && (
                <div className="space-y-2">
                  <Label>Compartilhado com:</Label>
                  <div className="flex flex-wrap gap-2">
                    {activeWorkspace.shared_with.map((email) => (
                      <Badge key={email} variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        {email}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Templates de Workspace
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {Array.isArray(templates) && templates.map((template) => (
                  <Card key={template.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{template.name}</h4>
                        <Badge variant="outline">{template.role}</Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                      
                      <Button
                        size="sm"
                        onClick={() => createFromTemplate(template)}
                        className="w-full"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Usar Template
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}