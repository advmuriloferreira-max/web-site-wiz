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
          escritorio_id: string
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
          escritorio_id: string
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
          escritorio_id?: string
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
          {
            foreignKeyName: "analises_juros_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
            referencedColumns: ["id"]
          },
        ]
      }
      analises_juros_abusivos: {
        Row: {
          abusividade_detectada: boolean | null
          contrato_id: string
          created_at: string | null
          data_analise: string | null
          data_referencia: string | null
          diferenca_absoluta: number | null
          diferenca_percentual: number | null
          escritorio_id: string
          fonte_taxa_bacen: string | null
          id: string
          metodologia: string | null
          modalidade_bacen_id: string | null
          numero_parcelas: number | null
          observacoes: string | null
          taxa_contratual: number | null
          taxa_media_bacen: number | null
          taxa_real_aplicada: number | null
          updated_at: string | null
          usuario_id: string | null
          valor_financiado: number | null
          valor_parcela: number | null
        }
        Insert: {
          abusividade_detectada?: boolean | null
          contrato_id: string
          created_at?: string | null
          data_analise?: string | null
          data_referencia?: string | null
          diferenca_absoluta?: number | null
          diferenca_percentual?: number | null
          escritorio_id: string
          fonte_taxa_bacen?: string | null
          id?: string
          metodologia?: string | null
          modalidade_bacen_id?: string | null
          numero_parcelas?: number | null
          observacoes?: string | null
          taxa_contratual?: number | null
          taxa_media_bacen?: number | null
          taxa_real_aplicada?: number | null
          updated_at?: string | null
          usuario_id?: string | null
          valor_financiado?: number | null
          valor_parcela?: number | null
        }
        Update: {
          abusividade_detectada?: boolean | null
          contrato_id?: string
          created_at?: string | null
          data_analise?: string | null
          data_referencia?: string | null
          diferenca_absoluta?: number | null
          diferenca_percentual?: number | null
          escritorio_id?: string
          fonte_taxa_bacen?: string | null
          id?: string
          metodologia?: string | null
          modalidade_bacen_id?: string | null
          numero_parcelas?: number | null
          observacoes?: string | null
          taxa_contratual?: number | null
          taxa_media_bacen?: number | null
          taxa_real_aplicada?: number | null
          updated_at?: string | null
          usuario_id?: string | null
          valor_financiado?: number | null
          valor_parcela?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analises_juros_abusivos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_juros_abusivos_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_juros_abusivos_modalidade_bacen_id_fkey"
            columns: ["modalidade_bacen_id"]
            isOneToOne: false
            referencedRelation: "modalidades_bacen_juros"
            referencedColumns: ["id"]
          },
        ]
      }
      analises_provisionamento: {
        Row: {
          base_calculo: string | null
          classificacao_risco: string | null
          contrato_id: string
          created_at: string | null
          data_calculo: string | null
          data_ultimo_pagamento: string | null
          dias_atraso: number | null
          escritorio_id: string
          id: string
          meses_atraso: number | null
          metodologia: string | null
          observacoes: string | null
          percentual_provisao: number | null
          updated_at: string | null
          usuario_id: string | null
          valor_divida: number
          valor_provisao: number | null
        }
        Insert: {
          base_calculo?: string | null
          classificacao_risco?: string | null
          contrato_id: string
          created_at?: string | null
          data_calculo?: string | null
          data_ultimo_pagamento?: string | null
          dias_atraso?: number | null
          escritorio_id: string
          id?: string
          meses_atraso?: number | null
          metodologia?: string | null
          observacoes?: string | null
          percentual_provisao?: number | null
          updated_at?: string | null
          usuario_id?: string | null
          valor_divida: number
          valor_provisao?: number | null
        }
        Update: {
          base_calculo?: string | null
          classificacao_risco?: string | null
          contrato_id?: string
          created_at?: string | null
          data_calculo?: string | null
          data_ultimo_pagamento?: string | null
          dias_atraso?: number | null
          escritorio_id?: string
          id?: string
          meses_atraso?: number | null
          metodologia?: string | null
          observacoes?: string | null
          percentual_provisao?: number | null
          updated_at?: string | null
          usuario_id?: string | null
          valor_divida?: number
          valor_provisao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analises_provisionamento_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_provisionamento_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
            referencedColumns: ["id"]
          },
        ]
      }
      analises_socioeconomicas: {
        Row: {
          capacidade_pagamento: number
          cliente_id: string | null
          created_at: string | null
          despesas_essenciais: number
          detalhes_despesas: Json | null
          escritorio_id: string
          id: string
          minimo_existencial: number
          percentual_comprometimento: number
          renda_liquida: number
          situacao: string | null
        }
        Insert: {
          capacidade_pagamento: number
          cliente_id?: string | null
          created_at?: string | null
          despesas_essenciais: number
          detalhes_despesas?: Json | null
          escritorio_id: string
          id?: string
          minimo_existencial: number
          percentual_comprometimento: number
          renda_liquida: number
          situacao?: string | null
        }
        Update: {
          capacidade_pagamento?: number
          cliente_id?: string | null
          created_at?: string | null
          despesas_essenciais?: number
          detalhes_despesas?: Json | null
          escritorio_id?: string
          id?: string
          minimo_existencial?: number
          percentual_comprometimento?: number
          renda_liquida?: number
          situacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analises_socioeconomicas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes_superendividamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_socioeconomicas_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
            referencedColumns: ["id"]
          },
        ]
      }
      analises_superendividamento: {
        Row: {
          cliente_id: string
          created_at: string | null
          data_analise: string | null
          encargo_mensal_atual: number | null
          encargo_mensal_proposto: number | null
          escritorio_id: string
          id: string
          metodologia: string | null
          observacoes: string | null
          percentual_comprometimento: number | null
          reducao_mensal: number | null
          reducao_percentual: number | null
          renda_liquida: number
          total_dividas: number | null
          updated_at: string | null
          usuario_id: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          data_analise?: string | null
          encargo_mensal_atual?: number | null
          encargo_mensal_proposto?: number | null
          escritorio_id: string
          id?: string
          metodologia?: string | null
          observacoes?: string | null
          percentual_comprometimento?: number | null
          reducao_mensal?: number | null
          reducao_percentual?: number | null
          renda_liquida: number
          total_dividas?: number | null
          updated_at?: string | null
          usuario_id?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          data_analise?: string | null
          encargo_mensal_atual?: number | null
          encargo_mensal_proposto?: number | null
          escritorio_id?: string
          id?: string
          metodologia?: string | null
          observacoes?: string | null
          percentual_comprometimento?: number | null
          reducao_mensal?: number | null
          reducao_percentual?: number | null
          renda_liquida?: number
          total_dividas?: number | null
          updated_at?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analises_superendividamento_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_superendividamento_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
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
      clientes: {
        Row: {
          cep: string | null
          cidade: string | null
          cpf_cnpj: string
          created_at: string | null
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          escritorio_id: string
          estado: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          cpf_cnpj: string
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          escritorio_id: string
          estado?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          cpf_cnpj?: string
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          escritorio_id?: string
          estado?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes_juros: {
        Row: {
          cpf_cnpj: string | null
          created_at: string
          data_cadastro: string
          email: string | null
          endereco: string | null
          escritorio_id: string
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
          escritorio_id: string
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
          escritorio_id?: string
          id?: string
          nome?: string
          observacoes?: string | null
          responsavel?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_juros_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes_provisao: {
        Row: {
          cpf_cnpj: string | null
          created_at: string
          data_cadastro: string
          email: string | null
          endereco: string | null
          escritorio_id: string
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
          escritorio_id: string
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
          escritorio_id?: string
          id?: string
          nome?: string
          observacoes?: string | null
          responsavel?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_provisao_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes_superendividamento: {
        Row: {
          composicao_familiar: Json | null
          cpf: string | null
          created_at: string | null
          desconto_inss: number | null
          desconto_ir: number | null
          escritorio_id: string
          id: string
          nome: string
          observacoes: string | null
          renda_bruta: number | null
          renda_liquida: number | null
          updated_at: string | null
        }
        Insert: {
          composicao_familiar?: Json | null
          cpf?: string | null
          created_at?: string | null
          desconto_inss?: number | null
          desconto_ir?: number | null
          escritorio_id: string
          id?: string
          nome: string
          observacoes?: string | null
          renda_bruta?: number | null
          renda_liquida?: number | null
          updated_at?: string | null
        }
        Update: {
          composicao_familiar?: Json | null
          cpf?: string | null
          created_at?: string | null
          desconto_inss?: number | null
          desconto_ir?: number | null
          escritorio_id?: string
          id?: string
          nome?: string
          observacoes?: string | null
          renda_bruta?: number | null
          renda_liquida?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_superendividamento_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos: {
        Row: {
          banco_id: string | null
          cliente_id: string
          created_at: string | null
          data_assinatura: string | null
          data_primeiro_vencimento: string | null
          data_ultimo_pagamento: string | null
          escritorio_id: string
          id: string
          modalidade_bacen_id: string | null
          numero_contrato: string | null
          numero_parcelas: number | null
          observacoes: string | null
          status: string | null
          taxa_juros_contratual: number | null
          tipo_operacao: string | null
          updated_at: string | null
          valor_contrato: number | null
          valor_financiado: number | null
          valor_parcela: number | null
        }
        Insert: {
          banco_id?: string | null
          cliente_id: string
          created_at?: string | null
          data_assinatura?: string | null
          data_primeiro_vencimento?: string | null
          data_ultimo_pagamento?: string | null
          escritorio_id: string
          id?: string
          modalidade_bacen_id?: string | null
          numero_contrato?: string | null
          numero_parcelas?: number | null
          observacoes?: string | null
          status?: string | null
          taxa_juros_contratual?: number | null
          tipo_operacao?: string | null
          updated_at?: string | null
          valor_contrato?: number | null
          valor_financiado?: number | null
          valor_parcela?: number | null
        }
        Update: {
          banco_id?: string | null
          cliente_id?: string
          created_at?: string | null
          data_assinatura?: string | null
          data_primeiro_vencimento?: string | null
          data_ultimo_pagamento?: string | null
          escritorio_id?: string
          id?: string
          modalidade_bacen_id?: string | null
          numero_contrato?: string | null
          numero_parcelas?: number | null
          observacoes?: string | null
          status?: string | null
          taxa_juros_contratual?: number | null
          tipo_operacao?: string | null
          updated_at?: string | null
          valor_contrato?: number | null
          valor_financiado?: number | null
          valor_parcela?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_banco_id_fkey"
            columns: ["banco_id"]
            isOneToOne: false
            referencedRelation: "bancos_provisao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_modalidade_bacen_id_fkey"
            columns: ["modalidade_bacen_id"]
            isOneToOne: false
            referencedRelation: "modalidades_bacen_juros"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos_juros: {
        Row: {
          cliente_id: string
          created_at: string
          data_contratacao: string
          diferenca_taxa: number | null
          diferenca_vs_bacen: number | null
          escritorio_id: string
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
          escritorio_id: string
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
          escritorio_id?: string
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
            foreignKeyName: "contratos_juros_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
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
          escritorio_id: string
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
          escritorio_id: string
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
          escritorio_id?: string
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
          {
            foreignKeyName: "contratos_provisao_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
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
      dividas_analise_super: {
        Row: {
          analise_superendividamento_id: string
          contrato_id: string | null
          created_at: string | null
          credor: string
          escritorio_id: string
          id: string
          numero_parcelas_restantes: number | null
          parcela_mensal_atual: number
          tipo_divida: string | null
          updated_at: string | null
          valor_total_divida: number
        }
        Insert: {
          analise_superendividamento_id: string
          contrato_id?: string | null
          created_at?: string | null
          credor: string
          escritorio_id: string
          id?: string
          numero_parcelas_restantes?: number | null
          parcela_mensal_atual: number
          tipo_divida?: string | null
          updated_at?: string | null
          valor_total_divida: number
        }
        Update: {
          analise_superendividamento_id?: string
          contrato_id?: string | null
          created_at?: string | null
          credor?: string
          escritorio_id?: string
          id?: string
          numero_parcelas_restantes?: number | null
          parcela_mensal_atual?: number
          tipo_divida?: string | null
          updated_at?: string | null
          valor_total_divida?: number
        }
        Relationships: [
          {
            foreignKeyName: "dividas_analise_super_analise_superendividamento_id_fkey"
            columns: ["analise_superendividamento_id"]
            isOneToOne: false
            referencedRelation: "analises_superendividamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dividas_analise_super_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dividas_analise_super_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
            referencedColumns: ["id"]
          },
        ]
      }
      dividas_superendividamento: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          credor: string
          escritorio_id: string
          id: string
          observacoes: string | null
          parcela_mensal_atual: number | null
          tipo_divida: string | null
          valor_atual: number
          valor_original: number
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          credor: string
          escritorio_id: string
          id?: string
          observacoes?: string | null
          parcela_mensal_atual?: number | null
          tipo_divida?: string | null
          valor_atual: number
          valor_original: number
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          credor?: string
          escritorio_id?: string
          id?: string
          observacoes?: string | null
          parcela_mensal_atual?: number | null
          tipo_divida?: string | null
          valor_atual?: number
          valor_original?: number
        }
        Relationships: [
          {
            foreignKeyName: "dividas_superendividamento_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes_superendividamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dividas_superendividamento_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
            referencedColumns: ["id"]
          },
        ]
      }
      escritorios: {
        Row: {
          cnpj: string | null
          configuracoes: Json | null
          created_at: string | null
          data_cadastro: string | null
          data_vencimento: string | null
          email: string
          endereco: string | null
          id: string
          limite_clientes: number | null
          limite_contratos: number | null
          limite_usuarios: number | null
          nome: string
          plano: string | null
          status: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          cnpj?: string | null
          configuracoes?: Json | null
          created_at?: string | null
          data_cadastro?: string | null
          data_vencimento?: string | null
          email: string
          endereco?: string | null
          id?: string
          limite_clientes?: number | null
          limite_contratos?: number | null
          limite_usuarios?: number | null
          nome: string
          plano?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          cnpj?: string | null
          configuracoes?: Json | null
          created_at?: string | null
          data_cadastro?: string | null
          data_vencimento?: string | null
          email?: string
          endereco?: string | null
          id?: string
          limite_clientes?: number | null
          limite_contratos?: number | null
          limite_usuarios?: number | null
          nome?: string
          plano?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fases_plano: {
        Row: {
          created_at: string | null
          credor_quitado: string | null
          credores_ativos: Json | null
          detalhes_json: Json | null
          distribuicao: Json | null
          duracao_meses: number | null
          escritorio_id: string | null
          id: string
          numero_fase: number
          parcelas_na_fase: number
          plano_id: string | null
          plano_pagamento_id: string | null
          tipo_fase: string | null
          valor_mensal_total: number | null
        }
        Insert: {
          created_at?: string | null
          credor_quitado?: string | null
          credores_ativos?: Json | null
          detalhes_json?: Json | null
          distribuicao?: Json | null
          duracao_meses?: number | null
          escritorio_id?: string | null
          id?: string
          numero_fase: number
          parcelas_na_fase: number
          plano_id?: string | null
          plano_pagamento_id?: string | null
          tipo_fase?: string | null
          valor_mensal_total?: number | null
        }
        Update: {
          created_at?: string | null
          credor_quitado?: string | null
          credores_ativos?: Json | null
          detalhes_json?: Json | null
          distribuicao?: Json | null
          duracao_meses?: number | null
          escritorio_id?: string | null
          id?: string
          numero_fase?: number
          parcelas_na_fase?: number
          plano_id?: string | null
          plano_pagamento_id?: string | null
          tipo_fase?: string | null
          valor_mensal_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fases_plano_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fases_plano_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos_pagamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fases_plano_plano_pagamento_id_fkey"
            columns: ["plano_pagamento_id"]
            isOneToOne: false
            referencedRelation: "planos_pagamento"
            referencedColumns: ["id"]
          },
        ]
      }
      fases_plano_super: {
        Row: {
          created_at: string | null
          detalhes_json: Json | null
          duracao_meses: number
          escritorio_id: string
          id: string
          numero_fase: number
          plano_pagamento_id: string
          tipo_fase: string | null
          updated_at: string | null
          valor_mensal_total: number
        }
        Insert: {
          created_at?: string | null
          detalhes_json?: Json | null
          duracao_meses: number
          escritorio_id: string
          id?: string
          numero_fase: number
          plano_pagamento_id: string
          tipo_fase?: string | null
          updated_at?: string | null
          valor_mensal_total: number
        }
        Update: {
          created_at?: string | null
          detalhes_json?: Json | null
          duracao_meses?: number
          escritorio_id?: string
          id?: string
          numero_fase?: number
          plano_pagamento_id?: string
          tipo_fase?: string | null
          updated_at?: string | null
          valor_mensal_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "fases_plano_super_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fases_plano_super_plano_pagamento_id_fkey"
            columns: ["plano_pagamento_id"]
            isOneToOne: false
            referencedRelation: "planos_pagamento_super"
            referencedColumns: ["id"]
          },
        ]
      }
      garantias_provisao: {
        Row: {
          contrato_id: string
          created_at: string
          descricao: string | null
          escritorio_id: string
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
          escritorio_id: string
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
          escritorio_id?: string
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
          {
            foreignKeyName: "garantias_provisao_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
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
          escritorio_id: string
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
          escritorio_id: string
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
          escritorio_id?: string
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
          {
            foreignKeyName: "parcelas_contrato_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
            referencedColumns: ["id"]
          },
        ]
      }
      planos_pagamento: {
        Row: {
          analise_superendividamento_id: string | null
          cliente_id: string | null
          created_at: string | null
          escritorio_id: string
          id: string
          percentual_renda: number | null
          status: string | null
          total_dividas: number
          total_fases: number
          total_parcelas: number
          valor_mensal_total: number
        }
        Insert: {
          analise_superendividamento_id?: string | null
          cliente_id?: string | null
          created_at?: string | null
          escritorio_id: string
          id?: string
          percentual_renda?: number | null
          status?: string | null
          total_dividas: number
          total_fases: number
          total_parcelas: number
          valor_mensal_total: number
        }
        Update: {
          analise_superendividamento_id?: string | null
          cliente_id?: string | null
          created_at?: string | null
          escritorio_id?: string
          id?: string
          percentual_renda?: number | null
          status?: string | null
          total_dividas?: number
          total_fases?: number
          total_parcelas?: number
          valor_mensal_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "planos_pagamento_analise_superendividamento_id_fkey"
            columns: ["analise_superendividamento_id"]
            isOneToOne: false
            referencedRelation: "analises_superendividamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_pagamento_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes_superendividamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_pagamento_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
            referencedColumns: ["id"]
          },
        ]
      }
      planos_pagamento_super: {
        Row: {
          analise_superendividamento_id: string
          created_at: string | null
          dividas_impagaveis: number | null
          escritorio_id: string
          id: string
          total_fases: number | null
          total_meses: number | null
          updated_at: string | null
          valor_total_pago: number | null
        }
        Insert: {
          analise_superendividamento_id: string
          created_at?: string | null
          dividas_impagaveis?: number | null
          escritorio_id: string
          id?: string
          total_fases?: number | null
          total_meses?: number | null
          updated_at?: string | null
          valor_total_pago?: number | null
        }
        Update: {
          analise_superendividamento_id?: string
          created_at?: string | null
          dividas_impagaveis?: number | null
          escritorio_id?: string
          id?: string
          total_fases?: number | null
          total_meses?: number | null
          updated_at?: string | null
          valor_total_pago?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "planos_pagamento_super_analise_superendividamento_id_fkey"
            columns: ["analise_superendividamento_id"]
            isOneToOne: false
            referencedRelation: "analises_superendividamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_pagamento_super_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
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
          escritorio_id: string
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
          escritorio_id: string
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
          escritorio_id?: string
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
          {
            foreignKeyName: "processos_provisao_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
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
          escritorio_id: string
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
          escritorio_id: string
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
          escritorio_id?: string
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
          {
            foreignKeyName: "propostas_acordo_provisao_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
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
      tabela_provisao_bcb352: {
        Row: {
          carteira: string
          descricao: string | null
          id: number
          meses_atraso_max: number | null
          meses_atraso_min: number
          percentual_provisao: number
        }
        Insert: {
          carteira: string
          descricao?: string | null
          id?: number
          meses_atraso_max?: number | null
          meses_atraso_min: number
          percentual_provisao: number
        }
        Update: {
          carteira?: string
          descricao?: string | null
          id?: number
          meses_atraso_max?: number | null
          meses_atraso_min?: number
          percentual_provisao?: number
        }
        Relationships: []
      }
      taxas_juros_bacen: {
        Row: {
          categoria: string
          codigo_serie: number
          created_at: string | null
          data_referencia: string
          id: number
          nome_modalidade: string
          sub_categoria: string
          taxa_mensal: number
        }
        Insert: {
          categoria: string
          codigo_serie: number
          created_at?: string | null
          data_referencia: string
          id?: number
          nome_modalidade: string
          sub_categoria: string
          taxa_mensal: number
        }
        Update: {
          categoria?: string
          codigo_serie?: number
          created_at?: string | null
          data_referencia?: string
          id?: number
          nome_modalidade?: string
          sub_categoria?: string
          taxa_mensal?: number
        }
        Relationships: []
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
      usuarios_escritorio: {
        Row: {
          cargo: string | null
          created_at: string | null
          data_cadastro: string | null
          email: string
          escritorio_id: string
          id: string
          nome: string
          permissoes: Json | null
          status: string | null
          ultimo_acesso: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cargo?: string | null
          created_at?: string | null
          data_cadastro?: string | null
          email: string
          escritorio_id: string
          id?: string
          nome: string
          permissoes?: Json | null
          status?: string | null
          ultimo_acesso?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cargo?: string | null
          created_at?: string | null
          data_cadastro?: string | null
          email?: string
          escritorio_id?: string
          id?: string
          nome?: string
          permissoes?: Json | null
          status?: string | null
          ultimo_acesso?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_escritorio_escritorio_id_fkey"
            columns: ["escritorio_id"]
            isOneToOne: false
            referencedRelation: "escritorios"
            referencedColumns: ["id"]
          },
        ]
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
      v_dividas_superendividamento: {
        Row: {
          analise_superendividamento_id: string | null
          contrato_id: string | null
          created_at: string | null
          credor: string | null
          escritorio_id: string | null
          escritorio_id_original: string | null
          fonte: string | null
          id: string | null
          numero_parcelas_restantes: number | null
          parcela_mensal_atual: number | null
          tipo_divida: string | null
          valor_total_divida: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      convite_valido: { Args: { invite_token: string }; Returns: boolean }
      generate_invite_token: { Args: never; Returns: string }
      get_convite_data: {
        Args: { invite_token: string }
        Returns: {
          email: string
          nome: string
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      get_user_escritorio_id: { Args: never; Returns: string }
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
      is_admin: { Args: { user_uuid: string }; Returns: boolean }
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
