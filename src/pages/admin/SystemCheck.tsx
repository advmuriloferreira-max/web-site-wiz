import { SystemCheckPanel } from '@/components/admin/SystemCheckPanel';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function SystemCheck() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/app/admin')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Dashboard Admin
        </Button>
      </div>

      <SystemCheckPanel />
    </div>
  );
}
