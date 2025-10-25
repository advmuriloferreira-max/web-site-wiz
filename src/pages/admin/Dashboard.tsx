import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  CreditCard, 
  Settings, 
  Plus, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  Building2,
  FileText,
  Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EstatisticasEscritorio {
  totalUsuarios: number;
  totalClientes: number;
  totalContratos: number;
  totalAnalises: number;
  limiteUsuarios: number;
  limiteClientes: number;
  limiteContratos: number;
}

export default function AdminDashboard() {
  const { usuarioEscritorio, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<EstatisticasEscritorio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (usuarioEscritorio?.escritorio_id) {
      loadEstatisticas();
    } else if (!authLoading) {
      // Se auth terminou de carregar e não tem escritório, parar loading
      setLoading(false);
    }
  }, [usuarioEscritorio, authLoading]);

  const loadEstatisticas = async () => {
    try {
      const escritorioId = usuarioEscritorio?.escritorio_id;
      
      // Buscar estatísticas em paralelo
      const [usuarios, clientes, contratos, analises, escritorio] = await Promise.all([
        supabase.from('usuarios_escritorio').select('id', { count: 'exact' }).eq('escritorio_id', escritorioId),
        supabase.from('clientes_provisao').select('id', { count: 'exact' }).eq('escritorio_id', escritorioId),
        supabase.from('contratos_provisao').select('id', { count: 'exact' }).eq('escritorio_id', escritorioId),
        supabase.from('analises_juros').select('id', { count: 'exact' }).eq('escritorio_id', escritorioId),
        supabase.from('escritorios').select('limite_usuarios, limite_clientes, limite_contratos').eq('id', escritorioId).single()
      ]);

      setStats({
        totalUsuarios: usuarios.count || 0,
        totalClientes: clientes.count || 0,
        totalContratos: contratos.count || 0,
        totalAnalises: analises.count || 0,
        limiteUsuarios: escritorio.data?.limite_usuarios || 0,
        limiteClientes: escritorio.data?.limite_clientes || 0,
        limiteContratos: escritorio.data?.limite_contratos || 0,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Loading do Auth ou dados
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Carregando dashboard administrativo...</p>
        </div>
      </div>
    );
  }

  // Verificar se escritório existe
  if (!usuarioEscritorio?.escritorio) {
    return (
      <div className="p-6">
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <h3 className="font-medium text-warning">Escritório não encontrado</h3>
          <p className="text-sm text-warning/80 mt-1">
            Não foi possível carregar as informações do escritório.
          </p>
        </div>
      </div>
    );
  }

  const getStatusPlano = () => {
    const { status, data_vencimento } = usuarioEscritorio.escritorio;
    
    if (status !== 'ativo') return { color: 'destructive' as const, text: 'Suspenso' };
    
    if (!data_vencimento) return { color: 'default' as const, text: 'Ativo' };
    
    const vencimento = new Date(data_vencimento);
    const hoje = new Date();
    const diasRestantes = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diasRestantes <= 0) return { color: 'destructive' as const, text: 'Vencido' };
    if (diasRestantes <= 7) return { color: 'secondary' as const, text: `${diasRestantes} dias restantes`, alert: true };
    return { color: 'default' as const, text: 'Ativo' };
  };

  const getPercentualUso = (usado: number, limite: number) => {
    return Math.min(100, (usado / limite) * 100);
  };

  const statusPlano = getStatusPlano();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            Administração
          </h1>
          <p className="text-muted-foreground">
            Gerencie seu escritório e usuários
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant={statusPlano.color}>
            {statusPlano.text}
          </Badge>
          
          <Button onClick={() => navigate('/configuracoes/escritorio')}>
            <Plus className="h-4 w-4 mr-2" />
            Convidar Usuário
          </Button>
        </div>
      </div>

      {/* Alerta de Vencimento */}
      {statusPlano.alert && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção!</strong> Seu plano vence em breve. Renove agora para não perder acesso ao sistema.
          </AlertDescription>
        </Alert>
      )}

      {/* Informações do Escritório */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Informações do Escritório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Nome</div>
              <div className="font-semibold text-lg">{usuarioEscritorio?.escritorio?.nome}</div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-1">Plano</div>
              <Badge variant={usuarioEscritorio?.escritorio?.plano === 'premium' ? 'default' : 'secondary'}>
                {usuarioEscritorio?.escritorio?.plano === 'premium' ? '⭐ Premium' : 'Essencial'}
              </Badge>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-1">Status</div>
              <Badge variant={usuarioEscritorio?.escritorio?.status === 'ativo' ? 'default' : 'destructive'}>
                {usuarioEscritorio?.escritorio?.status}
              </Badge>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-1">Vencimento</div>
              <div className="font-semibold">
                {usuarioEscritorio?.escritorio?.data_vencimento 
                  ? new Date(usuarioEscritorio.escritorio.data_vencimento).toLocaleDateString('pt-BR')
                  : 'Não definido'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas de Uso */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Usuários</p>
                <p className="text-3xl font-bold">
                  {stats?.totalUsuarios}
                  <span className="text-lg text-muted-foreground">/{stats?.limiteUsuarios}</span>
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-950/30 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all" 
                  style={{ 
                    width: `${getPercentualUso(stats?.totalUsuarios || 0, stats?.limiteUsuarios || 1)}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.limiteUsuarios && stats.totalUsuarios >= stats.limiteUsuarios * 0.8 && (
                  <span className="text-orange-600 font-medium">⚠️ Próximo do limite</span>
                )}
                {stats?.limiteUsuarios && stats.totalUsuarios < stats.limiteUsuarios * 0.8 && (
                  <span>{((stats?.totalUsuarios || 0) / (stats?.limiteUsuarios || 1) * 100).toFixed(0)}% utilizado</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Clientes</p>
                <p className="text-3xl font-bold">
                  {stats?.totalClientes}
                  <span className="text-lg text-muted-foreground">/{stats?.limiteClientes}</span>
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-950/30 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all" 
                  style={{ 
                    width: `${getPercentualUso(stats?.totalClientes || 0, stats?.limiteClientes || 1)}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.limiteClientes && stats.totalClientes >= stats.limiteClientes * 0.8 && (
                  <span className="text-orange-600 font-medium">⚠️ Próximo do limite</span>
                )}
                {stats?.limiteClientes && stats.totalClientes < stats.limiteClientes * 0.8 && (
                  <span>{((stats?.totalClientes || 0) / (stats?.limiteClientes || 1) * 100).toFixed(0)}% utilizado</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Contratos</p>
                <p className="text-3xl font-bold">
                  {stats?.totalContratos}
                  <span className="text-lg text-muted-foreground">/{stats?.limiteContratos}</span>
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-950/30 rounded-full">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all" 
                  style={{ 
                    width: `${getPercentualUso(stats?.totalContratos || 0, stats?.limiteContratos || 1)}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.limiteContratos && stats.totalContratos >= stats.limiteContratos * 0.8 && (
                  <span className="text-orange-600 font-medium">⚠️ Próximo do limite</span>
                )}
                {stats?.limiteContratos && stats.totalContratos < stats.limiteContratos * 0.8 && (
                  <span>{((stats?.totalContratos || 0) / (stats?.limiteContratos || 1) * 100).toFixed(0)}% utilizado</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Análises</p>
                <p className="text-3xl font-bold">{stats?.totalAnalises}</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-950/30 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Total de análises realizadas
              </p>
              {stats?.totalAnalises && stats.totalAnalises > 0 && (
                <p className="text-xs font-medium text-green-600">
                  ✓ Sistema em uso ativo
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
            onClick={() => navigate('/configuracoes/escritorio')}
          >
            <CardContent className="p-6 text-center">
              <div className="p-4 bg-blue-100 dark:bg-blue-950/30 rounded-full w-fit mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2 text-lg">Gerenciar Usuários</h3>
              <p className="text-sm text-muted-foreground">
                Adicione, remova e configure permissões dos usuários do escritório
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
            onClick={() => navigate('/configuracoes/escritorio')}
          >
            <CardContent className="p-6 text-center">
              <div className="p-4 bg-green-100 dark:bg-green-950/30 rounded-full w-fit mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2 text-lg">Planos e Cobrança</h3>
              <p className="text-sm text-muted-foreground">
                Altere seu plano, gerencie pagamentos e visualize faturas
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
            onClick={() => navigate('/configuracoes')}
          >
            <CardContent className="p-6 text-center">
              <div className="p-4 bg-purple-100 dark:bg-purple-950/30 rounded-full w-fit mx-auto mb-4">
                <Settings className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2 text-lg">Configurações</h3>
              <p className="text-sm text-muted-foreground">
                Personalize as configurações gerais do sistema
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
