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
      bancos: {
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
      contratos: {
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
          data_ultimo_pagamento: string | null
          data_vencimento: string | null
          dias_atraso: number | null
          escritorio_banco_acordo: string | null
          forma_pagamento: string | null
          id: string
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
          data_ultimo_pagamento?: string | null
          data_vencimento?: string | null
          dias_atraso?: number | null
          escritorio_banco_acordo?: string | null
          forma_pagamento?: string | null
          id?: string
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
          data_ultimo_pagamento?: string | null
          data_vencimento?: string | null
          dias_atraso?: number | null
          escritorio_banco_acordo?: string | null
          forma_pagamento?: string | null
          id?: string
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
            foreignKeyName: "contratos_banco_id_fkey"
            columns: ["banco_id"]
            isOneToOne: false
            referencedRelation: "bancos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      processos: {
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
            foreignKeyName: "processos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
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
          updated_at: string
        }
        Insert: {
          cargo?: string | null
          created_at?: string
          email: string
          id: string
          nome: string
          updated_at?: string
        }
        Update: {
          cargo?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
