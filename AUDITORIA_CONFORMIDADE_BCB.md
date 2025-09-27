# AUDITORIA DE CONFORMIDADE - RESOLUÇÕES BCB 4.966/2021 e 352/2023

## RESUMO EXECUTIVO

Após análise detalhada do sistema em relação às Resoluções BCB 4.966/2021 e 352/2023, foram identificadas **INCORREÇÕES CRÍTICAS** que comprometem a conformidade regulatória do sistema.

## ❌ PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. **SISTEMA DE CLASSIFICAÇÃO INCORRETO**
**Problema:** O sistema utiliza classificação C1-C5 baseada em dias de atraso, que NÃO existe nas resoluções vigentes.

**Localização dos erros:**
- `src/lib/calculoProvisao.ts`: Linhas 4, 259-295
- `src/components/calculadora/`: Vários componentes
- `src/hooks/useProvisao.ts`: Interfaces com C1-C5
- Tabelas do banco: `provisao_perda_esperada` e `provisao_perdas_incorridas`

**Impacto:** Sistema está usando metodologia REVOGADA da antiga Resolução 2.682.

### 2. **CONCEITO INCORRETO DE "PERDAS INCORRIDAS"**
**Problema:** O sistema trata "perdas incorridas" como uma categoria separada de cálculo, quando nas resoluções se refere ao modelo contábil anterior (não IFRS 9).

**Correto conforme BCB:** Deve usar apenas "perdas esperadas" com metodologia de três estágios.

### 3. **TABELAS DE REFERÊNCIA INCORRETAS**
**Problema:** Tabelas usam percentuais fixos por "classificação" C1-C5, que não existem nas resoluções.

**Correto conforme BCB:** Percentuais devem ser calculados baseados em:
- Probabilidade de Default (PD)
- Loss Given Default (LGD) 
- Exposure at Default (EAD)

### 4. **MISTURA DE METODOLOGIAS**
**Problema:** Sistema mistura conceitos da Resolução 2.682 (revogada) com conceitos das resoluções vigentes.

## ✅ PONTOS CORRETOS IMPLEMENTADOS

### 1. **SISTEMA DE TRÊS ESTÁGIOS**
- ✅ Estágio 1: <= 30 dias (sem aumento significativo de risco)
- ✅ Estágio 2: 31-90 dias (aumento significativo de risco)  
- ✅ Estágio 3: > 90 dias (ativo problemático)

### 2. **MARCO DE 90 DIAS**
- ✅ Correto para caracterizar ativo problemático
- ✅ Implementado em `determinarEstagio()`

### 3. **CONCEITO DE REESTRUTURAÇÃO**
- ✅ Período de observação de 6 meses
- ✅ Estágio mínimo 2 durante observação

## 🔧 CORREÇÕES NECESSÁRIAS

### PRIORIDADE CRÍTICA

#### 1. **REMOVER SISTEMA C1-C5**
```typescript
// ❌ REMOVER
export type ClassificacaoRisco = 'C1' | 'C2' | 'C3' | 'C4' | 'C5';

// ✅ SUBSTITUIR POR
export type EstagioRisco = 1 | 2 | 3;
```

#### 2. **IMPLEMENTAR CÁLCULO POR ESTÁGIOS**
```typescript
// ✅ CORRETO conforme BCB 4.966/2021
const calcularProvisaoPorEstagio = (estagio: EstagioRisco, valorDivida: number, pd: number, lgd: number) => {
  switch (estagio) {
    case 1: // 12 meses de perdas esperadas
      return valorDivida * (pd / 100) * (lgd / 100);
    case 2: // Lifetime de perdas esperadas  
      return valorDivida * (pd / 100) * (lgd / 100);
    case 3: // Perdas esperadas (ativo problemático)
      return valorDivida * (pd / 100) * (lgd / 100);
  }
};
```

#### 3. **RECRIAR TABELAS DE REFERÊNCIA**
- Remover tabelas com classificação C1-C5
- Criar parâmetros para PD, LGD por estágio e tipo de garantia
- Implementar metodologia IFRS 9 completa

#### 4. **CORRIGIR TIPOS DE OPERAÇÃO**
Implementar classificação baseada no TIPO DE OPERAÇÃO conforme Art. 81 da BCB 352/2023:
- Créditos com garantia real
- Créditos com garantia fidejussória  
- Créditos sem garantia
- etc.

### PRIORIDADE ALTA

#### 5. **IMPLEMENTAR METODOLOGIA COMPLETA IFRS 9**
- Cálculo de PD forward-looking
- LGD ajustado por garantias
- EAD considerando utilização de limites
- Cenários macroeconômicos

#### 6. **CORRIGIR DOCUMENTAÇÃO E LABELS**
- Remover referências a C1-C5 em toda interface
- Atualizar labels para "Estágio 1/2/3"
- Corrigir help texts e tooltips

## 📊 IMPACTO REGULATÓRIO

### RISCOS IDENTIFICADOS:
1. **Não conformidade** com BCB 4.966/2021 e 352/2023
2. **Cálculos incorretos** de provisão
3. **Risco regulatório** para usuários do sistema
4. **Audit findings** em eventuais fiscalizações

### BENEFÍCIOS DA CORREÇÃO:
1. **Conformidade total** com normativas vigentes
2. **Cálculos precisos** de provisão
3. **Redução de risco regulatório**
4. **Preparação para metodologia avançada** (se aplicável)

## 🚀 PLANO DE IMPLEMENTAÇÃO SUGERIDO

### FASE 1 - CORREÇÕES CRÍTICAS (Prioridade Máxima)
1. Remover sistema C1-C5 
2. Implementar cálculo por estágios puros
3. Corrigir tabelas de referência básicas
4. Atualizar interface principal

### FASE 2 - METODOLOGIA AVANÇADA
1. Implementar PD/LGD/EAD completo
2. Cenários forward-looking
3. Ajustes por garantias refinados
4. Validação e backtesting

### FASE 3 - RECURSOS AVANÇADOS  
1. Stress testing
2. Metodologia IRB (se aplicável)
3. Relatórios regulatórios automatizados
4. Integração com sistemas de risco

## ⚠️ RECOMENDAÇÃO URGENTE

**O sistema atual NÃO está em conformidade com as resoluções BCB vigentes.** 

É necessária **correção imediata** antes de usar em ambiente de produção, sob risco de:
- Cálculos incorretos de provisão
- Não conformidade regulatória
- Exposição a riscos de auditoria/fiscalização

---
**Data da Auditoria:** 27/09/2025  
**Resoluções Analisadas:** BCB 4.966/2021 e BCB 352/2023  
**Status:** CRÍTICO - Correção necessária