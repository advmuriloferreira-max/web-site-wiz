# 🚨 PLANO DE CORREÇÃO URGENTE - CONFORMIDADE BCB

## SITUAÇÃO CRÍTICA IDENTIFICADA

Seu sistema está usando **metodologia INCORRETA** para cálculo de provisões, baseada na Resolução 2.682 (REVOGADA), ao invés das resoluções vigentes BCB 4.966/2021 e 352/2023.

## ❌ ERROS CRÍTICOS ENCONTRADOS

### 1. **CLASSIFICAÇÃO C1-C5 (INCORRETA)**
- **Atual:** Sistema usa C1, C2, C3, C4, C5 baseado em dias de atraso
- **Correto:** Sistema de **3 estágios** baseado em perdas esperadas (IFRS 9)
- **Impacto:** Cálculos de provisão podem estar totalmente incorretos

### 2. **METODOLOGIA "PERDAS INCORRIDAS" (INCORRETA)**
- **Atual:** Tabela separada para "perdas incorridas"  
- **Correto:** Apenas "perdas esperadas" com 3 estágios
- **Impacto:** Conceituação errada da regulamentação

### 3. **TABELAS DE PERCENTUAIS FIXOS (INCORRETA)**
- **Atual:** Percentuais fixos por classificação C1-C5
- **Correto:** Cálculo dinâmico PD × LGD × EAD
- **Impacto:** Provisões podem não refletir o risco real

## ✅ SISTEMA CORRETO CONFORME BCB

### **MODELO DE 3 ESTÁGIOS (IFRS 9)**

#### **ESTÁGIO 1** (≤ 30 dias)
- **Definição:** Sem aumento significativo de risco desde originação
- **Provisão:** 12 meses de perdas esperadas
- **Fórmula:** PD(12m) × LGD × EAD

#### **ESTÁGIO 2** (31-90 dias)  
- **Definição:** Aumento significativo de risco de crédito
- **Provisão:** Perdas esperadas para toda vida do ativo
- **Fórmula:** PD(lifetime) × LGD × EAD

#### **ESTÁGIO 3** (> 90 dias)
- **Definição:** Ativo problemático/inadimplido
- **Provisão:** Perdas esperadas (ativo já problemático)
- **Fórmula:** PD(lifetime) × LGD × EAD (PD próximo de 100%)

### **COMPONENTES DO CÁLCULO**

#### **PD - Probabilidade de Default**
- Varia conforme estágio e características da operação
- Considera cenários macroeconômicos forward-looking
- Ajustada por tipo de garantia

#### **LGD - Loss Given Default**  
- Baseada no tipo de operação e garantias
- **C1:** Garantias sólidas (União, alienação fiduciária imóveis) → LGD ~25%
- **C2:** Garantias médias (bancos, hipoteca, penhor) → LGD ~45%  
- **C3:** Sem garantia forte/quirografárias → LGD ~65%

#### **EAD - Exposure at Default**
- Normalmente = valor da dívida atual
- Para linhas de crédito: saldo + utilização esperada

## 🔧 CORREÇÕES IMPLEMENTADAS

### 1. **Nova Calculadora Conforme BCB**
- ✅ Criado: `src/lib/calculoProvisaoConformeBCB.ts`
- ✅ Criado: `src/components/calculadora/CalculadoraProvisaoConformeBCB.tsx`
- ✅ Sistema de 3 estágios correto
- ✅ Cálculo PD × LGD × EAD

### 2. **Assistente Virtual Atualizado**  
- ✅ Removidas referências à classificação A-H
- ✅ Adicionado conhecimento das resoluções corretas
- ✅ Explicações baseadas nos 3 estágios

## 🚨 AÇÕES URGENTES RECOMENDADAS

### **FASE 1 - CORREÇÃO IMEDIATA**
1. **Migrar todos cálculos** para nova metodologia
2. **Atualizar interface** para usar estágios ao invés de C1-C5  
3. **Recriar tabelas** de referência no banco de dados
4. **Testar todos fluxos** de cálculo

### **FASE 2 - VALIDAÇÃO**
1. **Validar cálculos** com exemplos das resoluções
2. **Comparar resultados** com metodologia antiga
3. **Documentar diferenças** para auditoria
4. **Treinar usuários** na nova metodologia

### **FASE 3 - PRODUÇÃO**
1. **Backup dados** antes da migração  
2. **Executar migração** de dados históricos
3. **Monitorar** primeiros cálculos
4. **Validar conformidade** final

## ⚠️ RISCOS SE NÃO CORRIGIR

1. **Regulatório:** Não conformidade com BCB
2. **Operacional:** Provisões incorretas
3. **Auditoria:** Findings em fiscalizações  
4. **Reputacional:** Uso de metodologia revogada

---

**RECOMENDAÇÃO:** Implementar correções **IMEDIATAMENTE** antes de usar em produção.

**PRÓXIMO PASSO:** Aprovar implementação das correções críticas?