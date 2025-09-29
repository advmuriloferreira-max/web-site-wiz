import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWorkspace, UserPreferences } from '@/hooks/useWorkspace';

interface WorkspaceContextType {
  userPreferences: UserPreferences | null;
  applyPreferences: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspaceContext must be used within WorkspaceProvider');
  }
  return context;
}

interface WorkspaceProviderProps {
  children: React.ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const { userPreferences } = useWorkspace();

  const applyPreferences = () => {
    if (!userPreferences) return;

    const root = document.documentElement;

    // Apply font scale
    root.style.fontSize = `${userPreferences.font_scale * 16}px`;

    // Apply layout density
    const densityClasses = {
      compact: 'density-compact',
      comfortable: 'density-comfortable',
      spacious: 'density-spacious'
    };

    // Remove existing density classes
    Object.values(densityClasses).forEach(cls => {
      document.body.classList.remove(cls);
    });

    // Add current density class
    document.body.classList.add(densityClasses[userPreferences.layout_density]);

    // Apply sidebar width as CSS variable
    root.style.setProperty('--sidebar-width', `${userPreferences.sidebar_width}px`);

    // Apply color theme if any
    if (userPreferences.color_theme && typeof userPreferences.color_theme === 'object') {
      Object.entries(userPreferences.color_theme).forEach(([key, value]) => {
        if (typeof value === 'string') {
          root.style.setProperty(`--color-${key}`, value);
        }
      });
    }
  };

  useEffect(() => {
    applyPreferences();
  }, [userPreferences]);

  return (
    <WorkspaceContext.Provider value={{ userPreferences, applyPreferences }}>
      {children}
    </WorkspaceContext.Provider>
  );
}