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
      garantias: {
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
            foreignKeyName: "garantias_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
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
      propostas_acordo: {
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
            foreignKeyName: "propostas_acordo_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
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
