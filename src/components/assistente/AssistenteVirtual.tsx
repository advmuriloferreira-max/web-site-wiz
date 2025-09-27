import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface AssistenteVirtualProps {
  contratoContext?: any;
}

const AssistenteVirtual: React.FC<AssistenteVirtualProps> = ({ contratoContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Mensagem de boas-vindas
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: `Olá! Sou seu assistente virtual especializado em direito bancário. Posso ajudar com:

📋 **Interpretação de regulamentações** (BCB 4966/2021, 352/2023)
📊 **Explicação de cálculos** de provisão
⚖️ **Análise de garantias** bancárias
🔄 **Sugestões de renegociação**
📈 **Classificação de riscos**

${contratoContext ? `Vejo que você está visualizando o contrato ${contratoContext.numero}. Posso ajudar com questões específicas sobre este contrato.` : 'Como posso ajudá-lo hoje?'}`,
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, contratoContext]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    console.log('AssistenteVirtual: Enviando mensagem:', inputMessage);
    console.log('AssistenteVirtual: User ID:', user?.id);
    console.log('AssistenteVirtual: Contrato Context:', contratoContext);

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('AssistenteVirtual: Chamando edge function...');
      const { data, error } = await supabase.functions.invoke('assistente-virtual', {
        body: {
          message: inputMessage,
          contratoContext,
          userId: user?.id,
        },
      });

      console.log('AssistenteVirtual: Resposta da edge function:', { data, error });

      if (error) {
        console.error('AssistenteVirtual: Erro da edge function:', error);
        throw error;
      }

      if (!data.success) {
        console.error('AssistenteVirtual: Edge function retornou erro:', data.error);
        throw new Error(data.error || 'Erro desconhecido');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      console.log('Erro completo:', JSON.stringify(error, null, 2));
      toast({
        title: "Erro",
        description: `Não foi possível enviar a mensagem: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Erro: ${error.message || 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em alguns instantes.'}`,
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getQuickQuestions = () => {
    const baseQuestions = [
      "Como calcular a provisão para este contrato?",
      "Qual a classificação de risco adequada?",
      "Quais garantias são aceitas pelo BCB?",
      "Como renegociar esta operação?",
    ];

    const contratoQuestions = contratoContext ? [
      `Analise o risco do contrato ${contratoContext.numero}`,
      "Sugira melhorias nas garantias",
      "Avalie o status atual do contrato",
    ] : [];

    return [...baseQuestions, ...contratoQuestions];
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px]">
      <Card className="h-full flex flex-col shadow-2xl border bg-background">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5 text-primary" />
            Assistente Jurídico
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-4 h-full">
          <div className="flex-1 overflow-y-auto max-h-96 pr-2 mb-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.sender === 'assistant' && (
                        <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      )}
                      {message.sender === 'user' && (
                        <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Pensando...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {messages.length === 1 && (
            <div className="space-y-2 mb-4">
              <p className="text-xs text-muted-foreground">Perguntas sugeridas:</p>
              <div className="grid grid-cols-1 gap-1">
                {getQuickQuestions().slice(0, 3).map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-2 px-3 text-left justify-start"
                    onClick={() => {
                      console.log('Clicou na pergunta:', question);
                      setInputMessage(question);
                      // Enviar automaticamente a pergunta
                      setTimeout(() => {
                        sendMessage();
                      }, 100);
                    }}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Digite sua pergunta..."
              value={inputMessage}
              onChange={(e) => {
                console.log('Input mudou:', e.target.value);
                setInputMessage(e.target.value);
              }}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={() => {
                console.log('Botão enviar clicado');
                sendMessage();
              }}
              disabled={!inputMessage.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssistenteVirtual;