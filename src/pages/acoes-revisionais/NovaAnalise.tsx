import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";
import NavigationBar from "@/components/NavigationBar";

export default function NovaAnalise() {
  return (
    <>
      <NavigationBar />
      <div className="container mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Construction className="h-6 w-6 text-yellow-600" />
              Nova Análise Completa
            </CardTitle>
            <CardDescription>
              Esta funcionalidade será implementada no próximo prompt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Aguarde a implementação completa do módulo de Ações Revisionais.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
