import { useState } from 'react';
import { Bell, CheckCheck, ExternalLink, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useAlertasProvisao,
  useAlertasNaoLidos,
  useMarcarAlertaLido,
  useMarcarTodosLidos,
  AlertaProvisao
} from '@/hooks/useAlertasProvisao';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function AlertasProvisao() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data: todosAlertas = [] } = useAlertasProvisao();
  const { data: alertasNaoLidos = [] } = useAlertasNaoLidos();
  const marcarLido = useMarcarAlertaLido();
  const marcarTodosLidos = useMarcarTodosLidos();

  const handleAlertaClick = (alerta: AlertaProvisao) => {
    // Marcar como lido ao clicar
    if (!alerta.lido) {
      marcarLido.mutate(alerta.id);
    }
    
    // Navegar para a análise
    navigate(`/app/gestao-passivo/${alerta.analise_id}`);
    setOpen(false);
  };

  const handleMarcarTodosLidos = () => {
    marcarTodosLidos.mutate();
  };

  const getAlertaIcon = (tipo: string) => {
    switch (tipo) {
      case 'momento_premium':
        return '💎';
      case 'momento_total':
        return '🔥';
      case 'mudanca_marco':
        return '🎯';
      default:
        return '📢';
    }
  };

  const getAlertaColor = (tipo: string) => {
    switch (tipo) {
      case 'momento_premium':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'momento_total':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'mudanca_marco':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const formatTempo = (data: string) => {
    try {
      return formatDistanceToNow(new Date(data), {
        addSuffix: true,
        locale: ptBR
      });
    } catch {
      return 'há algum tempo';
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {alertasNaoLidos.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {alertasNaoLidos.length > 9 ? '9+' : alertasNaoLidos.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-96">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h3 className="font-semibold">Alertas de Provisão</h3>
            {alertasNaoLidos.length > 0 && (
              <Badge variant="secondary">{alertasNaoLidos.length} novos</Badge>
            )}
          </div>
          
          {alertasNaoLidos.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarcarTodosLidos}
              className="h-8 text-xs"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Marcar todos lidos
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {todosAlertas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                Nenhum alerta ainda
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Você será notificado sobre mudanças importantes
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {todosAlertas.map((alerta) => (
                <button
                  key={alerta.id}
                  onClick={() => handleAlertaClick(alerta)}
                  className={`w-full text-left p-4 hover:bg-accent transition-colors ${
                    !alerta.lido ? 'bg-accent/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl mt-0.5">
                      {getAlertaIcon(alerta.tipo_alerta)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getAlertaColor(alerta.tipo_alerta)}>
                          {alerta.tipo_alerta === 'momento_premium' && 'Premium'}
                          {alerta.tipo_alerta === 'momento_total' && 'Total'}
                          {alerta.tipo_alerta === 'mudanca_marco' && 'Mudança'}
                        </Badge>
                        
                        {!alerta.lido && (
                          <Badge variant="destructive" className="h-2 w-2 p-0 rounded-full" />
                        )}
                      </div>
                      
                      <p className="text-sm font-medium mb-1 line-clamp-2">
                        {alerta.mensagem}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTempo(alerta.created_at)}
                        </span>
                        
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {todosAlertas.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full justify-center text-sm"
                onClick={() => {
                  navigate('/app/gestao-passivo/dashboard');
                  setOpen(false);
                }}
              >
                Ver Dashboard de Oportunidades
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
