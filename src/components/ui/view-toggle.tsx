import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, LayoutGrid } from 'lucide-react';

interface ViewToggleProps {
  view: 'table' | 'cards';
  onViewChange: (view: 'table' | 'cards') => void;
  className?: string;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  view,
  onViewChange,
  className = ''
}) => {
  return (
    <div className={`flex items-center border rounded-md ${className}`}>
      <Button
        variant={view === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('table')}
        className="rounded-r-none border-r"
      >
        <Table className="h-4 w-4 mr-2" />
        Tabela
      </Button>
      <Button
        variant={view === 'cards' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('cards')}
        className="rounded-l-none"
      >
        <LayoutGrid className="h-4 w-4 mr-2" />
        Cards
      </Button>
    </div>
  );
};