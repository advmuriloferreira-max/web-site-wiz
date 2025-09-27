import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface UseAssistenteVirtualProps {
  contratoContext?: any;
}

export const useAssistenteVirtual = ({ contratoContext }: UseAssistenteVirtualProps = {}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('assistente-virtual', {
        body: {
          message: content,
          contratoContext,
          userId: user?.id,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Erro desconhecido');

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em alguns instantes.",
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [contratoContext, user?.id, isLoading, toast]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const getQuickQuestions = useCallback(() => {
    const baseQuestions = [
      "Como calcular a provisão para este contrato?",
      "Qual a classificação de risco adequada?",
      "Quais garantias são aceitas pelo BCB?",
      "Como renegociar esta operação?",
      "Explique a Resolução BCB 4966/2021",
      "Critérios para crédito rural (Resolução 352/2023)",
    ];

    const contratoQuestions = contratoContext ? [
      `Analise o risco do contrato ${contratoContext.numero}`,
      "Sugira melhorias nas garantias",
      "Avalie o status atual do contrato",
      "Calcule a provisão necessária",
    ] : [];

    return [...baseQuestions, ...contratoQuestions];
  }, [contratoContext]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    getQuickQuestions,
  };
};