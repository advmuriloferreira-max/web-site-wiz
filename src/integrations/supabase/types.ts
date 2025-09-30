export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analises_juros: {
        Row: {
          analista_id: string | null
          calculo_regra_3: Json | null
          contrato_id: string
          created_at: string
          custo_efetivo_total: number | null
          data_analise: string
          diferenca_mercado: number | null
          documentos: Json | null
          id: string
          parecer: string | null
          percentual_acima_mercado: number | null
          recomendacao: string | null
          taxa_efetiva_anual: number | null
          taxa_efetiva_mensal: number | null
          taxa_mercado_periodo: number | null
          updated_at: string
          valor_cobrado_indevido: number | null
        }
        Insert: {
          analista_id?: string | null
          calculo_regra_3?: Json | null
          contrato_id: string
          created_at?: string
          custo_efetivo_total?: number | null
          data_analise?: string
          diferenca_mercado?: number | null
          documentos?: Json | null
          id?: string
          parecer?: string | null
          percentual_acima_mercado?: number | null
          recomendacao?: string | null
          taxa_efetiva_anual?: number | null
          taxa_efetiva_mensal?: number | null
          taxa_mercado_periodo?: number | null
          updated_at?: string
          valor_cobrado_indevido?: number | null
        }
        Update: {
          analista_id?: string | null
          calculo_regra_3?: Json | null
          contrato_id?: string
          created_at?: string
          custo_efetivo_total?: number | null
          data_analise?: string
          diferenca_mercado?: number | null
          documentos?: Json | null
          id?: string
          parecer?: string | null
          percentual_acima_mercado?: number | null
          recomendacao?: string | null
          taxa_efetiva_anual?: number | null
          taxa_efetiva_mensal?: number | null
          taxa_mercado_periodo?: number | null
          updated_at?: string
          valor_cobrado_indevido?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analises_juros_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos_juros"
            referencedColumns: ["id"]
          },
        ]
      }
      analyses: {
        Row: {
          contrato_id: string
          created_at: string | null
          data_consulta: string | null
          id: string
          metadata: Json | null
          taxa_bacen: number | null
          taxa_referencia: string | null
          updated_at: string | null
        }
        Insert: {
          contrato_id: string
          created_at?: string | null
          data_consulta?: string | null
          id?: string
          metadata?: Json | null
          taxa_bacen?: number | null
          taxa_referencia?: string | null
          updated_at?: string | null
        }
        Update: {
          contrato_id?: string
          created_at?: string | null
          data_consulta?: string | null
          id?: string
          metadata?: Json | null
          taxa_bacen?: number | null
          taxa_referencia?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analyses_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos_provisao"
            referencedColumns: ["id"]
          },
        ]
      }
      assistente_logs: {
        Row: {
          contexto_contrato: string | null
          created_at: string
          id: string
          pergunta: string
          resposta: string
          user_id: string | null
        }
        Insert: {
          contexto_contrato?: string | null
          created_at?: string
          id?: string
          pergunta: string
          resposta: string
          user_id?: string | null
        }
        Update: {
          contexto_contrato?: string | null
          created_at?: string
          id?: string
          pergunta?: string
          resposta?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bancos_provisao: {
        Row: {
          codigo_banco: string | null
          contato: string | null
          created_at: string
          email: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          codigo_banco?: string | null
          contato?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          codigo_banco?: string | null
          contato?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      clientes_juros: {
        Row: {
          cpf_cnpj: string | null
          created_at: string
          data_cadastro: string
          email: string | null
          endereco: string | null
          id: string
          nome: string
          observacoes: string | null
          responsavel: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cpf_cnpj?: string | null
          created_at?: string
          data_cadastro?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          responsavel?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cpf_cnpj?: string | null
          created_at?: string
          data_cadastro?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          responsavel?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      clientes_provisao: {
        Row: {
          cpf_cnpj: string | null
          created_at: string
          data_cadastro: string
          email: string | null
          endereco: string | null
          id: string
          nome: string
          observacoes: string | null
          responsavel: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cpf_cnpj?: string | null
          created_at?: string
          data_cadastro?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          responsavel?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cpf_cnpj?: string | null
          created_at?: string
          data_cadastro?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          responsavel?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contratos_juros: {
        Row: {
          cliente_id: string
          created_at: string
          data_contratacao: string
          diferenca_taxa: number | null
          diferenca_vs_bacen: number | null
          grau_abusividade: string | null
          id: string
          instituicao_id: string
          modalidade_bacen_id: string | null
          numero_contrato: string | null
          numero_parcelas: number | null
          observacoes: string | null
          percentual_diferenca: number | null
          status_analise: string | null
          taxa_bacen_referencia: number | null
          taxa_juros_contratual: number | null
          taxa_juros_real: number | null
          tem_abusividade: boolean | null
          tipo_operacao: string | null
          ultima_analise_em: string | null
          updated_at: string
          valor_financiado: number
          valor_parcela: number | null
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_contratacao?: string
          diferenca_taxa?: number | null
          diferenca_vs_bacen?: number | null
          grau_abusividade?: string | null
          id?: string
          instituicao_id: string
          modalidade_bacen_id?: string | null
          numero_contrato?: string | null
          numero_parcelas?: number | null
          observacoes?: string | null
          percentual_diferenca?: number | null
          status_analise?: string | null
          taxa_bacen_referencia?: number | null
          taxa_juros_contratual?: number | null
          taxa_juros_real?: number | null
          tem_abusividade?: boolean | null
          tipo_operacao?: string | null
          ultima_analise_em?: string | null
          updated_at?: string
          valor_financiado: number
          valor_parcela?: number | null
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_contratacao?: string
          diferenca_taxa?: number | null
          diferenca_vs_bacen?: number | null
          grau_abusividade?: string | null
          id?: string
          instituicao_id?: string
          modalidade_bacen_id?: string | null
          numero_contrato?: string | null
          numero_parcelas?: number | null
          observacoes?: string | null
          percentual_diferenca?: number | null
          status_analise?: string | null
          taxa_bacen_referencia?: number | null
          taxa_juros_contratual?: number | null
          taxa_juros_real?: number | null
          tem_abusividade?: boolean | null
          tipo_operacao?: string | null
          ultima_analise_em?: string | null
          updated_at?: string
          valor_financiado?: number
          valor_parcela?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_juros_cliente_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes_juros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_juros_instituicao_fkey"
            columns: ["instituicao_id"]
            isOneToOne: false
            referencedRelation: "instituicoes_financeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_juros_modalidade_bacen_id_fkey"
            columns: ["modalidade_bacen_id"]
            isOneToOne: false
            referencedRelation: "modalidades_bacen_juros"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos_provisao: {
        Row: {
          acordo_final: number | null
          banco_id: string
          classificacao: string | null
          cliente_id: string
          contato_acordo_nome: string | null
          contato_acordo_telefone: string | null
          created_at: string
          data_conclusao: string | null
          data_entrada: string
          data_entrada_escritorio: string | null
          data_reestruturacao: string | null
          data_ultimo_pagamento: string | null
          data_vencimento: string | null
          dias_atraso: number | null
          escritorio_banco_acordo: string | null
          estagio_risco: number | null
          forma_pagamento: string | null
          id: string
          is_reestruturado: boolean | null
          meses_atraso: number | null
          numero_contrato: string | null
          numero_parcelas: number | null
          observacoes: string | null
          percentual_honorarios: number | null
          percentual_provisao: number | null
          proposta_acordo: number | null
          quantidade_planos: number | null
          reducao_divida: number | null
          saldo_contabil: number | null
          situacao: string | null
          taxa_bacen: number | null
          taxa_referencia: string | null
          tempo_escritorio: number | null
          tipo_operacao: string | null
          tipo_operacao_bcb: string | null
          updated_at: string
          valor_divida: number
          valor_honorarios: number | null
          valor_parcela: number | null
          valor_provisao: number | null
        }
        Insert: {
          acordo_final?: number | null
          banco_id: string
          classificacao?: string | null
          cliente_id: string
          contato_acordo_nome?: string | null
          contato_acordo_telefone?: string | null
          created_at?: string
          data_conclusao?: string | null
          data_entrada?: string
          data_entrada_escritorio?: string | null
          data_reestruturacao?: string | null
          data_ultimo_pagamento?: string | null
          data_vencimento?: string | null
          dias_atraso?: number | null
          escritorio_banco_acordo?: string | null
          estagio_risco?: number | null
          forma_pagamento?: string | null
          id?: string
          is_reestruturado?: boolean | null
          meses_atraso?: number | null
          numero_contrato?: string | null
          numero_parcelas?: number | null
          observacoes?: string | null
          percentual_honorarios?: number | null
          percentual_provisao?: number | null
          proposta_acordo?: number | null
          quantidade_planos?: number | null
          reducao_divida?: number | null
          saldo_contabil?: number | null
          situacao?: string | null
          taxa_bacen?: number | null
          taxa_referencia?: string | null
          tempo_escritorio?: number | null
          tipo_operacao?: string | null
          tipo_operacao_bcb?: string | null
          updated_at?: string
          valor_divida: number
          valor_honorarios?: number | null
          valor_parcela?: number | null
          valor_provisao?: number | null
        }
        Update: {
          acordo_final?: number | null
          banco_id?: string
          classificacao?: string | null
          cliente_id?: string
          contato_acordo_nome?: string | null
          contato_acordo_telefone?: string | null
          created_at?: string
          data_conclusao?: string | null
          data_entrada?: string
          data_entrada_escritorio?: string | null
          data_reestruturacao?: string | null
          data_ultimo_pagamento?: string | null
          data_vencimento?: string | null
          dias_atraso?: number | null
          escritorio_banco_acordo?: string | null
          estagio_risco?: number | null
          forma_pagamento?: string | null
          id?: string
          is_reestruturado?: boolean | null
          meses_atraso?: number | null
          numero_contrato?: string | null
          numero_parcelas?: number | null
          observacoes?: string | null
          percentual_honorarios?: number | null
          percentual_provisao?: number | null
          proposta_acordo?: number | null
          quantidade_planos?: number | null
          reducao_divida?: number | null
          saldo_contabil?: number | null
          situacao?: string | null
          taxa_bacen?: number | null
          taxa_referencia?: string | null
          tempo_escritorio?: number | null
          tipo_operacao?: string | null
          tipo_operacao_bcb?: string | null
          updated_at?: string
          valor_divida?: number
          valor_honorarios?: number | null
          valor_parcela?: number | null
          valor_provisao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_provisao_banco_id_fkey"
            columns: ["banco_id"]
            isOneToOne: false
            referencedRelation: "bancos_provisao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_provisao_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes_provisao"
            referencedColumns: ["id"]
          },
        ]
      }
      convites: {
        Row: {
          created_at: string
          created_by: string
          email: string
          expires_at: string
          id: string
          nome: string
          role: Database["public"]["Enums"]["app_role"]
          token: string
          updated_at: string
          usado: boolean | null
          usado_em: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          email: string
          expires_at: string
          id?: string
          nome: string
          role?: Database["public"]["Enums"]["app_role"]
          token: string
          updated_at?: string
          usado?: boolean | null
          usado_em?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          email?: string
          expires_at?: string
          id?: string
          nome?: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
          updated_at?: string
          usado?: boolean | null
          usado_em?: string | null
        }
        Relationships: []
      }
      dashboard_layouts: {
        Row: {
          created_at: string
          id: string
          is_default: boolean | null
          layout: Json
          name: string
          updated_at: string
          user_id: string
          widgets: Json
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          layout?: Json
          name?: string
          updated_at?: string
          user_id: string
          widgets?: Json
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          layout?: Json
          name?: string
          updated_at?: string
          user_id?: string
          widgets?: Json
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_layouts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspace_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      garantias_provisao: {
        Row: {
          contrato_id: string
          created_at: string
          descricao: string | null
          id: string
          percentual_cobertura: number | null
          tipo_garantia: string
          updated_at: string
          valor_avaliacao: number | null
        }
        Insert: {
          contrato_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          percentual_cobertura?: number | null
          tipo_garantia: string
          updated_at?: string
          valor_avaliacao?: number | null
        }
        Update: {
          contrato_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          percentual_cobertura?: number | null
          tipo_garantia?: string
          updated_at?: string
          valor_avaliacao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "garantias_provisao_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos_provisao"
            referencedColumns: ["id"]
          },
        ]
      }
      instituicoes_financeiras: {
        Row: {
          cnpj: string | null
          codigo_banco: string | null
          contato: string | null
          created_at: string
          email: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          codigo_banco?: string | null
          contato?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          codigo_banco?: string | null
          contato?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      modalidades_bacen_juros: {
        Row: {
          ativo: boolean | null
          categoria: string
          codigo_sgs: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          tipo_pessoa: string
          tipo_recurso: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          codigo_sgs: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          tipo_pessoa: string
          tipo_recurso: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          codigo_sgs?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          tipo_pessoa?: string
          tipo_recurso?: string
          updated_at?: string
        }
        Relationships: []
      }
      parcelas_contrato: {
        Row: {
          contrato_id: string
          created_at: string
          data_pagamento: string | null
          data_vencimento: string
          id: string
          numero_parcela: number
          valor_juros: number
          valor_pago: number | null
          valor_principal: number
          valor_total: number
        }
        Insert: {
          contrato_id: string
          created_at?: string
          data_pagamento?: string | null
          data_vencimento: string
          id?: string
          numero_parcela: number
          valor_juros: number
          valor_pago?: number | null
          valor_principal: number
          valor_total: number
        }
        Update: {
          contrato_id?: string
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string
          id?: string
          numero_parcela?: number
          valor_juros?: number
          valor_pago?: number | null
          valor_principal?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "parcelas_contrato_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos_juros"
            referencedColumns: ["id"]
          },
        ]
      }
      processos_provisao: {
        Row: {
          acao: string | null
          contrato_id: string
          created_at: string
          diligencias: string | null
          id: string
          justica_gratuita: boolean | null
          liminar: boolean | null
          numero_processo: string | null
          prazo: string | null
          protocolo: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          acao?: string | null
          contrato_id: string
          created_at?: string
          diligencias?: string | null
          id?: string
          justica_gratuita?: boolean | null
          liminar?: boolean | null
          numero_processo?: string | null
          prazo?: string | null
          protocolo?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          acao?: string | null
          contrato_id?: string
          created_at?: string
          diligencias?: string | null
          id?: string
          justica_gratuita?: boolean | null
          liminar?: boolean | null
          numero_processo?: string | null
          prazo?: string | null
          protocolo?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "processos_provisao_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos_provisao"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cargo: string | null
          created_at: string
          email: string
          id: string
          nome: string
          role: Database["public"]["Enums"]["app_role"] | null
          status: string | null
          updated_at: string
        }
        Insert: {
          cargo?: string | null
          created_at?: string
          email: string
          id: string
          nome: string
          role?: Database["public"]["Enums"]["app_role"] | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          cargo?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      propostas_acordo_provisao: {
        Row: {
          contrato_id: string
          created_at: string
          data_proposta: string
          id: string
          observacoes: string | null
          status: Database["public"]["Enums"]["status_proposta"]
          tipo_proposta: Database["public"]["Enums"]["tipo_proposta"]
          updated_at: string
          valor_proposta: number
        }
        Insert: {
          contrato_id: string
          created_at?: string
          data_proposta?: string
          id?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_proposta"]
          tipo_proposta: Database["public"]["Enums"]["tipo_proposta"]
          updated_at?: string
          valor_proposta: number
        }
        Update: {
          contrato_id?: string
          created_at?: string
          data_proposta?: string
          id?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_proposta"]
          tipo_proposta?: Database["public"]["Enums"]["tipo_proposta"]
          updated_at?: string
          valor_proposta?: number
        }
        Relationships: [
          {
            foreignKeyName: "propostas_acordo_provisao_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos_provisao"
            referencedColumns: ["id"]
          },
        ]
      }
      provisao_perda_esperada: {
        Row: {
          c1_percentual: number
          c2_percentual: number
          c3_percentual: number
          c4_percentual: number
          c5_percentual: number
          created_at: string
          id: string
          periodo_atraso: string
          prazo_final: number
          prazo_inicial: number
          updated_at: string
        }
        Insert: {
          c1_percentual: number
          c2_percentual: number
          c3_percentual: number
          c4_percentual: number
          c5_percentual: number
          created_at?: string
          id?: string
          periodo_atraso: string
          prazo_final: number
          prazo_inicial: number
          updated_at?: string
        }
        Update: {
          c1_percentual?: number
          c2_percentual?: number
          c3_percentual?: number
          c4_percentual?: number
          c5_percentual?: number
          created_at?: string
          id?: string
          periodo_atraso?: string
          prazo_final?: number
          prazo_inicial?: number
          updated_at?: string
        }
        Relationships: []
      }
      provisao_perdas_incorridas: {
        Row: {
          c1_percentual: number
          c2_percentual: number
          c3_percentual: number
          c4_percentual: number
          c5_percentual: number
          created_at: string
          criterio: string
          id: string
          prazo_final: number
          prazo_inicial: number
          updated_at: string
        }
        Insert: {
          c1_percentual: number
          c2_percentual: number
          c3_percentual: number
          c4_percentual: number
          c5_percentual: number
          created_at?: string
          criterio: string
          id?: string
          prazo_final: number
          prazo_inicial: number
          updated_at?: string
        }
        Update: {
          c1_percentual?: number
          c2_percentual?: number
          c3_percentual?: number
          c4_percentual?: number
          c5_percentual?: number
          created_at?: string
          criterio?: string
          id?: string
          prazo_final?: number
          prazo_inicial?: number
          updated_at?: string
        }
        Relationships: []
      }
      series_temporais_bacen: {
        Row: {
          ano: number
          created_at: string
          data_referencia: string
          id: string
          mes: number
          modalidade_id: string
          taxa_anual: number | null
          taxa_mensal: number
          updated_at: string
        }
        Insert: {
          ano: number
          created_at?: string
          data_referencia: string
          id?: string
          mes: number
          modalidade_id: string
          taxa_anual?: number | null
          taxa_mensal: number
          updated_at?: string
        }
        Update: {
          ano?: number
          created_at?: string
          data_referencia?: string
          id?: string
          mes?: number
          modalidade_id?: string
          taxa_anual?: number | null
          taxa_mensal?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "series_temporais_bacen_modalidade_id_fkey"
            columns: ["modalidade_id"]
            isOneToOne: false
            referencedRelation: "modalidades_bacen_juros"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_operacao_bcb: {
        Row: {
          carteira: string
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          carteira: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          carteira?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          color_theme: Json | null
          created_at: string
          font_scale: number | null
          id: string
          interface_config: Json | null
          layout_density: string | null
          sidebar_width: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color_theme?: Json | null
          created_at?: string
          font_scale?: number | null
          id?: string
          interface_config?: Json | null
          layout_density?: string | null
          sidebar_width?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color_theme?: Json | null
          created_at?: string
          font_scale?: number | null
          id?: string
          interface_config?: Json | null
          layout_density?: string | null
          sidebar_width?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workspace_configs: {
        Row: {
          config: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          shared_with: string[] | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          shared_with?: string[] | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          shared_with?: string[] | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workspace_templates: {
        Row: {
          config: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          layout: Json
          name: string
          role: string
          updated_at: string
          widgets: Json
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          layout?: Json
          name: string
          role: string
          updated_at?: string
          widgets?: Json
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          layout?: Json
          name?: string
          role?: string
          updated_at?: string
          widgets?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      convite_valido: {
        Args: { invite_token: string }
        Returns: boolean
      }
      generate_invite_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_convite_data: {
        Args: { invite_token: string }
        Returns: {
          email: string
          nome: string
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          check_role: Database["public"]["Enums"]["app_role"]
          user_uuid: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "advogado" | "assistente"
      status_proposta: "pendente" | "aceita" | "recusada"
      tipo_proposta: "enviada" | "recebida"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "advogado", "assistente"],
      status_proposta: ["pendente", "aceita", "recusada"],
      tipo_proposta: ["enviada", "recebida"],
    },
  },
} as const
