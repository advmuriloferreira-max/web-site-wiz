import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HelpCircle, AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";

export default function ExplicacaoEstagios() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Entendendo os Estágios da CMN 4.966</DialogTitle>
          <DialogDescription>
            Sistema de classificação de risco de crédito conforme Resolução CMN 4.966/2021
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* ESTÁGIO 1 */}
          <Card className="border-green-500/50">
            <CardHeader className="bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <CardTitle className="text-green-700 dark:text-green-400">
                    Estágio 1 - Risco Normal 🟢
                  </CardTitle>
                  <CardDescription>Instrumento financeiro sem aumento significativo de risco</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h4 className="font-semibold mb-2">O que é?</h4>
                <p className="text-sm text-muted-foreground">
                  Instrumento financeiro sem aumento significativo de risco de crédito desde a originação.
                  O devedor está cumprindo suas obrigações dentro do esperado.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Critérios de Classificação:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Atraso inferior a 30 dias no pagamento</li>
                  <li>Sem indicadores de deterioração creditícia</li>
                  <li>Operação performando conforme o contratado</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Provisão Requerida:</h4>
                <Badge variant="outline" className="text-green-600">
                  Perda esperada para os próximos 12 meses
                </Badge>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Significado Prático:</h4>
                <p className="text-sm text-muted-foreground">
                  Situação controlada com risco baixo. O banco não espera perdas significativas nesta operação.
                  Negociações devem focar em condições normais de mercado.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ESTÁGIO 2 */}
          <Card className="border-yellow-500/50">
            <CardHeader className="bg-yellow-50 dark:bg-yellow-950/20">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                <div>
                  <CardTitle className="text-yellow-700 dark:text-yellow-400">
                    Estágio 2 - Risco Aumentado 🟡
                  </CardTitle>
                  <CardDescription>Aumento significativo de risco, mas ainda não em default</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h4 className="font-semibold mb-2">O que é?</h4>
                <p className="text-sm text-muted-foreground">
                  Operação que apresentou aumento significativo no risco de crédito desde a originação,
                  mas ainda não está em situação de default (inadimplência superior a 90 dias).
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Critérios de Classificação:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Atraso entre 30 e 90 dias no pagamento</li>
                  <li>Presença de indicadores de deterioração creditícia</li>
                  <li>Mudanças adversas nas condições do devedor</li>
                  <li>Garantias insuficientes ou deterioradas</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Provisão Requerida:</h4>
                <Badge variant="outline" className="text-yellow-600">
                  Perda esperada para toda a vida do ativo
                </Badge>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Significado Prático:</h4>
                <p className="text-sm text-muted-foreground">
                  Atenção redobrada necessária. Monitoramento intensivo da operação.
                  Momento apropriado para renegociação preventiva. O banco está mais receptivo a propostas.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ESTÁGIO 3 */}
          <Card className="border-red-500/50">
            <CardHeader className="bg-red-50 dark:bg-red-950/20">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div>
                  <CardTitle className="text-red-700 dark:text-red-400">
                    Estágio 3 - Default 🔴
                  </CardTitle>
                  <CardDescription>Ativo problemático com problema de recuperação de crédito</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h4 className="font-semibold mb-2">O que é?</h4>
                <p className="text-sm text-muted-foreground">
                  Ativo caracterizado como problemático com evidência objetiva de perda por evento
                  causador de perda ou indicativo de que a obrigação não será integralmente honrada.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Critérios de Classificação:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Atraso superior a 90 dias no pagamento</li>
                  <li>Reestruturação do ativo por dificuldades financeiras</li>
                  <li>Falência decretada ou recuperação judicial</li>
                  <li>Medida judicial ou descumprimento de cláusulas</li>
                  <li>Evidência de incapacidade de pagamento</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Provisão Requerida:</h4>
                <Badge variant="outline" className="text-red-600">
                  Perda esperada para toda a vida do ativo
                </Badge>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Significado Prático:</h4>
                <p className="text-sm text-muted-foreground">
                  Negociação urgente necessária. O banco já provisionou o valor total ou grande parte.
                  Momento mais favorável para obter descontos significativos. O banco prefere recuperar
                  algo do que perder tudo.
                </p>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* INTEGRAÇÃO COM BCB 352 */}
          <Card>
            <CardHeader>
              <CardTitle>Integração com BCB 352</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                É importante entender a diferença entre os dois sistemas:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Estágios (CMN 4.966)</h4>
                  <p className="text-sm text-muted-foreground">
                    Classificam o <strong>RISCO</strong> da operação (1, 2 ou 3)
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                    <li>Baseado em dias de atraso e indicadores</li>
                    <li>Determina horizonte de provisão</li>
                    <li>Orientado por princípios contábeis</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Provisão (BCB 352)</h4>
                  <p className="text-sm text-muted-foreground">
                    Calculam o <strong>VALOR</strong> a provisionar (percentuais)
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                    <li>Tabelas específicas por carteira</li>
                    <li>Anexo I (&gt;90 dias) e Anexo II (0-90 dias)</li>
                    <li>Percentuais de 0.5% a 100%</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <p className="text-sm font-semibold mb-2">💡 Conclusão:</p>
                <p className="text-sm text-muted-foreground">
                  Os dois sistemas são <strong>complementares e obrigatórios</strong>. Os estágios classificam
                  o risco para fins de provisionamento de perda esperada, enquanto a BCB 352 define os
                  percentuais específicos a provisionar baseados no tempo de atraso e tipo de operação.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
