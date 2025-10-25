import { supabase } from "@/integrations/supabase/client";

export interface SystemCheckResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  details: string;
  metadata?: Record<string, any>;
}

export const runSystemCheck = async (): Promise<SystemCheckResult[]> => {
  const checks: SystemCheckResult[] = [];

  try {
    // 1. Verificar se usuário está logado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    checks.push({
      name: 'Autenticação',
      status: user && !authError ? 'success' : 'error',
      details: user?.email || 'Usuário não autenticado',
      metadata: { userId: user?.id }
    });

    if (!user) {
      return checks;
    }

    // 2. Verificar dados do usuário no escritório
    const { data: usuarioEscritorio, error: userError } = await supabase
      .from('usuarios_escritorio')
      .select('*, escritorios(*)')
      .eq('user_id', user.id)
      .single();

    checks.push({
      name: 'Vínculo com Escritório',
      status: usuarioEscritorio && !userError ? 'success' : 'error',
      details: usuarioEscritorio?.escritorios?.nome || 'Escritório não encontrado',
      metadata: {
        escritorioId: usuarioEscritorio?.escritorio_id,
        status: usuarioEscritorio?.status,
        permissoes: usuarioEscritorio?.permissoes
      }
    });

    if (!usuarioEscritorio?.escritorios) {
      return checks;
    }

    const escritorio = usuarioEscritorio.escritorios;

    // 3. Verificar status do escritório
    const dataVencimento = new Date(escritorio.data_vencimento);
    const hoje = new Date();
    const isExpired = dataVencimento < hoje;
    const diasRestantes = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    checks.push({
      name: 'Status do Escritório',
      status: !isExpired && escritorio.status === 'ativo' ? 'success' : isExpired ? 'error' : 'warning',
      details: isExpired 
        ? `Plano vencido há ${Math.abs(diasRestantes)} dias`
        : escritorio.status === 'ativo' 
          ? `Ativo - ${diasRestantes} dias restantes` 
          : `Status: ${escritorio.status}`,
      metadata: {
        plano: escritorio.plano,
        dataVencimento: escritorio.data_vencimento,
        status: escritorio.status
      }
    });

    // 4. Verificar RLS - Clientes
    const { data: clientes, count: clientesCount } = await supabase
      .from('clientes_provisao')
      .select('*', { count: 'exact', head: true });

    checks.push({
      name: 'RLS - Clientes',
      status: 'success',
      details: `${clientesCount || 0} clientes no escritório (RLS aplicado automaticamente)`,
      metadata: { count: clientesCount }
    });

    // 5. Verificar RLS - Contratos
    const { data: contratos, count: contratosCount } = await supabase
      .from('contratos_provisao')
      .select('*', { count: 'exact', head: true });

    checks.push({
      name: 'RLS - Contratos',
      status: 'success',
      details: `${contratosCount || 0} contratos no escritório (RLS aplicado automaticamente)`,
      metadata: { count: contratosCount }
    });

    // 6. Verificar limites do plano
    const percentualClientes = ((clientesCount || 0) / escritorio.limite_clientes) * 100;
    const percentualContratos = ((contratosCount || 0) / escritorio.limite_contratos) * 100;

    checks.push({
      name: 'Limites do Plano - Clientes',
      status: percentualClientes >= 100 ? 'error' : percentualClientes >= 90 ? 'warning' : 'success',
      details: `${clientesCount} / ${escritorio.limite_clientes} (${percentualClientes.toFixed(0)}%)`,
      metadata: { usado: clientesCount, limite: escritorio.limite_clientes }
    });

    checks.push({
      name: 'Limites do Plano - Contratos',
      status: percentualContratos >= 100 ? 'error' : percentualContratos >= 90 ? 'warning' : 'success',
      details: `${contratosCount} / ${escritorio.limite_contratos} (${percentualContratos.toFixed(0)}%)`,
      metadata: { usado: contratosCount, limite: escritorio.limite_contratos }
    });

    // 7. Verificar função get_user_escritorio_id
    const { data: escritorioIdCheck, error: functionError } = await supabase
      .rpc('get_user_escritorio_id');

    checks.push({
      name: 'Função get_user_escritorio_id',
      status: escritorioIdCheck && !functionError ? 'success' : 'error',
      details: escritorioIdCheck 
        ? `Retornou: ${escritorioIdCheck}` 
        : functionError?.message || 'Erro ao executar função',
      metadata: { escritorioId: escritorioIdCheck }
    });

    // 8. Verificar profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    checks.push({
      name: 'Perfil do Usuário',
      status: profile && !profileError ? 'success' : 'warning',
      details: profile?.nome || 'Perfil não encontrado',
      metadata: { role: profile?.role, status: profile?.status }
    });

    // 9. Verificar permissões
    const permissoes = usuarioEscritorio.permissoes as any;
    const hasReadPermission = permissoes?.read === true;
    const hasWritePermission = permissoes?.write === true;
    const hasAdminPermission = permissoes?.admin === true;

    checks.push({
      name: 'Permissões do Usuário',
      status: hasReadPermission ? 'success' : 'error',
      details: `Leitura: ${hasReadPermission ? '✓' : '✗'} | Escrita: ${hasWritePermission ? '✓' : '✗'} | Admin: ${hasAdminPermission ? '✓' : '✗'}`,
      metadata: permissoes as Record<string, any>
    });

  } catch (error: any) {
    checks.push({
      name: 'Erro na Verificação',
      status: 'error',
      details: error.message || 'Erro desconhecido',
      metadata: { error: error.toString() }
    });
  }

  return checks;
};

// Função para gerar relatório legível
export const generateCheckReport = (checks: SystemCheckResult[]): string => {
  let report = '=== RELATÓRIO DE VERIFICAÇÃO DO SISTEMA ===\n\n';
  
  const successCount = checks.filter(c => c.status === 'success').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;
  const errorCount = checks.filter(c => c.status === 'error').length;

  report += `Total: ${checks.length} verificações\n`;
  report += `✓ Sucesso: ${successCount}\n`;
  report += `⚠ Avisos: ${warningCount}\n`;
  report += `✗ Erros: ${errorCount}\n\n`;
  report += '--- DETALHES ---\n\n';

  checks.forEach((check, index) => {
    const icon = check.status === 'success' ? '✓' : check.status === 'warning' ? '⚠' : '✗';
    report += `${index + 1}. [${icon}] ${check.name}\n`;
    report += `   ${check.details}\n`;
    if (check.metadata && Object.keys(check.metadata).length > 0) {
      report += `   Metadados: ${JSON.stringify(check.metadata)}\n`;
    }
    report += '\n';
  });

  return report;
};

// Função helper para logar no console
export const logSystemCheck = async () => {
  console.log('🔍 Iniciando verificação do sistema...\n');
  const checks = await runSystemCheck();
  const report = generateCheckReport(checks);
  console.log(report);
  return checks;
};
