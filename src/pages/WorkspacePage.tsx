import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomizableDashboard } from '@/components/workspace/CustomizableDashboard';
import { WorkspaceSettings } from '@/components/workspace/WorkspaceSettings';
import { WorkspaceProvider } from '@/components/workspace/WorkspaceProvider';
import { 
  LayoutDashboard, 
  Settings, 
  Palette, 
  Users 
} from 'lucide-react';

export default function WorkspacePage() {
  return (
    <WorkspaceProvider>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Workspace</h1>
            <p className="text-muted-foreground">
              Personalize seu ambiente de trabalho
            </p>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <CustomizableDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <WorkspaceSettings />
          </TabsContent>
        </Tabs>
      </div>
    </WorkspaceProvider>
  );
}