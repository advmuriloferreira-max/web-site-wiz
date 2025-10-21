import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarioEstrategico } from "./CalendarioEstrategico";
import { ContadorOportunidade } from "./ContadorOportunidade";
import { Target } from "lucide-react";
import { Contrato } from "@/hooks/useContratos";

interface EstrategiaCompletaProps {
  contrato: Contrato;
}

export function EstrategiaCompleta({ contrato }: EstrategiaCompletaProps) {
  if (!contrato) {
    return null;
  }

  // Dados REAIS do contrato individual
  const valorDivida = contrato.saldo_contabil || contrato.valor_divida || 0;
  const diasAtraso = contrato.dias_atraso || 0;
  const percentualProvisaoAtual = contrato.percentual_provisao || 0;
  const valorProvisaoAtual = contrato.valor_provisao || 0;

  return (
    <div className="space-y-6">
      {/* Header da Seção */}
      <Card className="border-slate-200 shadow-sm bg-gradient-to-r from-green-50 to-teal-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <Target className="h-6 w-6 text-green-600" />
            Estratégia de Negociação
          </CardTitle>
          <p className="text-sm text-slate-600 mt-2">
            Use o timing a seu favor para conseguir os melhores descontos
          </p>
        </CardHeader>
      </Card>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contador de Oportunidade */}
        <div>
          <ContadorOportunidade
            valorDivida={valorDivida}
            diasAtraso={diasAtraso}
            percentualProvisaoAtual={percentualProvisaoAtual}
            valorProvisaoAtual={valorProvisaoAtual}
          />
        </div>

        {/* Calendário Estratégico */}
        <div>
          <CalendarioEstrategico
            valorDivida={valorDivida}
          />
        </div>
      </div>

      {/* Card de Ação Final */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="text-5xl">🎯</div>
            <div className="flex-1">
              <h4 className="font-bold text-green-900 text-lg mb-2">
                Sua Estratégia de Ação
              </h4>
              <div className="space-y-3 text-sm text-green-800">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <span className="font-semibold">Prepare-se Agora:</span> Organize toda documentação do contrato, comprovantes de pagamento e histórico.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <span className="font-semibold">Aguarde o Momento Certo:</span> Fique de olho no calendário e inicie contato 7-10 dias antes do "momento dourado".
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <span className="font-semibold">Negocie com Confiança:</span> Use os dados desta análise para fundamentar sua proposta. Mostre que você entende a situação.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <span className="font-semibold">Feche o Acordo:</span> Quando conseguir um bom desconto, aceite e formalize imediatamente. Não deixe a oportunidade passar.
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-white rounded border border-green-300">
                <p className="text-xs text-green-900">
                  <span className="font-bold">Lembre-se:</span> O banco quer receber. Você quer pagar menos. 
                  Com a estratégia certa e no momento certo, ambos saem ganhando. 
                  Esta análise te dá todas as ferramentas para uma negociação bem-sucedida!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
