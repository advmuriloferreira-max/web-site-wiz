# Sistema de Alertas de Provisão - Gestão de Passivo Bancário

## Visão Geral

O sistema de alertas estratégicos monitora automaticamente as análises de passivo bancário e notifica o advogado quando:

1. **Mudança de Marco de Provisionamento** - Um contrato muda de faixa (50%, 60%, 70%, 80%, 90%, 100%)
2. **Momento Premium** - Um contrato atinge 90% de provisão (proposta fixa de 10%)
3. **Momento Total** - Um contrato atinge 100% de provisão (proposta de 5-10%)

## Arquitetura

### Componentes

1. **Tabelas do Banco de Dados**:
   - `alertas_provisionamento` - Armazena os alertas gerados
   - `historico_provisao` - Armazena snapshots diários das provisões

2. **Função de Verificação**:
   - `src/lib/verificarAlertasProvisao.ts` - Lógica de comparação e geração de alertas
   - Pode ser chamada manualmente ou via edge function

3. **Edge Function**:
   - `supabase/functions/verificar-alertas-provisao` - Executa verificação automaticamente
   - Retorna relatório de alertas gerados

4. **Hook React**:
   - `src/hooks/useAlertasProvisao.ts` - Gerencia estado dos alertas no frontend
   - Atualiza automaticamente a cada 30 segundos

5. **Componente UI**:
   - `src/components/AlertasProvisao.tsx` - Dropdown de notificações no header
   - Badge com contador de alertas não lidos

## Configuração do Cron Job

### Opção 1: Cron Nativo do Supabase (Recomendado)

Execute este SQL no SQL Editor do Supabase:

```sql
-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Criar job para executar diariamente às 8h da manhã
SELECT cron.schedule(
  'verificar-alertas-provisao-diario',
  '0 8 * * *', -- Todos os dias às 8h (horário UTC)
  $$
  SELECT
    net.http_post(
        url:='https://uemxacekhtyvmmcuzhef.supabase.co/functions/v1/verificar-alertas-provisao',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlbXhhY2VraHR5dm1tY3V6aGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3Njc4NjMsImV4cCI6MjA3NDM0Mzg2M30.FwivQ40YPnSt7N5ypMugNhth6nZtQitVopDP78RS9Bk"}'::jsonb,
        body:=concat('{"timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);
```

### Opção 2: Executar Manualmente via Frontend

No código do frontend, você pode chamar manualmente:

```typescript
import { supabase } from '@/integrations/supabase/client';

async function executarVerificacao() {
  const { data, error } = await supabase.functions.invoke(
    'verificar-alertas-provisao',
    {
      body: { timestamp: new Date().toISOString() }
    }
  );
  
  if (error) {
    console.error('Erro ao verificar alertas:', error);
  } else {
    console.log('Verificação concluída:', data);
  }
}
```

### Opção 3: Trigger no Banco de Dados

Criar um trigger que executa quando uma análise é atualizada:

```sql
CREATE OR REPLACE FUNCTION check_provisao_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o percentual de provisão mudou significativamente
  IF NEW.percentual_provisao_bcb352 != OLD.percentual_provisao_bcb352 THEN
    -- Chamar função de verificação (via HTTP)
    PERFORM net.http_post(
      url := 'https://uemxacekhtyvmmcuzhef.supabase.co/functions/v1/verificar-alertas-provisao',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object('analise_id', NEW.id)::jsonb
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_provisao
AFTER UPDATE ON analises_gestao_passivo
FOR EACH ROW
EXECUTE FUNCTION check_provisao_changes();
```

## Gerenciamento de Cron Jobs

### Listar jobs ativos:

```sql
SELECT * FROM cron.job;
```

### Desabilitar um job:

```sql
SELECT cron.unschedule('verificar-alertas-provisao-diario');
```

### Ver histórico de execuções:

```sql
SELECT * FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'verificar-alertas-provisao-diario')
ORDER BY start_time DESC
LIMIT 10;
```

## Tipos de Alertas

### 1. Mudança de Marco (`mudanca_marco`)

Quando um contrato passa de um marco para outro (ex: 70% → 80%)

```
🎯 Contrato #12345 mudou de 70% para 80% de provisão.
Momento ideal para revisar estratégia de negociação!
```

### 2. Momento Premium (`momento_premium`)

Quando um contrato atinge 90% de provisão

```
💎 MOMENTO PREMIUM! Contrato #12345 atingiu 90% de provisão.
Banco aceitará acordo de 10% do saldo. Negocie agora!
```

### 3. Momento Total (`momento_total`)

Quando um contrato atinge 100% de provisão

```
🔥 PROVISÃO TOTAL! Contrato #12345 atingiu 100% de provisão.
Banco considerou irrecuperável. Proposta de 5-10% será aceita!
```

## Uso no Frontend

### Visualizar alertas não lidos:

```typescript
import { useAlertasNaoLidos } from '@/hooks/useAlertasProvisao';

function MeuComponente() {
  const { data: alertas = [] } = useAlertasNaoLidos();
  
  return (
    <div>
      Você tem {alertas.length} alertas não lidos
    </div>
  );
}
```

### Marcar alerta como lido:

```typescript
import { useMarcarAlertaLido } from '@/hooks/useAlertasProvisao';

function MeuComponente() {
  const marcarLido = useMarcarAlertaLido();
  
  const handleClick = (alertaId: string) => {
    marcarLido.mutate(alertaId);
  };
}
```

### Marcar todos como lidos:

```typescript
import { useMarcarTodosLidos } from '@/hooks/useAlertasProvisao';

function MeuComponente() {
  const marcarTodos = useMarcarTodosLidos();
  
  const handleMarcarTodos = () => {
    marcarTodos.mutate();
  };
}
```

## Monitoramento e Logs

### Ver logs da edge function:

1. Acesse o Supabase Dashboard
2. Vá em Functions → `verificar-alertas-provisao` → Logs
3. Filtre por data/horário

### Testar manualmente via curl:

```bash
curl -X POST \
  'https://uemxacekhtyvmmcuzhef.supabase.co/functions/v1/verificar-alertas-provisao' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}'
```

## Troubleshooting

### Alertas não estão sendo gerados

1. Verifique se o cron job está ativo:
```sql
SELECT * FROM cron.job WHERE jobname = 'verificar-alertas-provisao-diario';
```

2. Verifique logs da edge function no Dashboard

3. Execute manualmente a verificação:
```typescript
import { verificarAlertasProvisao } from '@/lib/verificarAlertasProvisao';
await verificarAlertasProvisao();
```

### Alertas duplicados

O sistema já possui proteção contra duplicação - verifica se existe alerta similar não lido nas últimas 24h antes de criar um novo.

### Performance

- O hook atualiza automaticamente a cada 30 segundos
- Limite de 50 alertas na listagem principal
- Alertas mais antigos que 30 dias podem ser arquivados

## Próximas Melhorias

- [ ] Enviar email quando alerta for gerado
- [ ] Push notifications no PWA
- [ ] WhatsApp notifications via API
- [ ] Dashboard de estatísticas de alertas
- [ ] Filtros avançados no dropdown
- [ ] Exportar histórico de alertas

## Links Úteis

- [Supabase Cron Jobs](https://supabase.com/docs/guides/database/extensions/pg_cron)
- [Edge Functions](https://supabase.com/docs/guides/functions)
- [pg_net Extension](https://supabase.com/docs/guides/database/extensions/pgnet)
