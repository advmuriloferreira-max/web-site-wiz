import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Building2, Save, Settings } from "lucide-react";
import { toast } from "sonner";

interface ConfiguracoesEmpresa {
  nome_empresa: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
  responsavel_legal: string;
  observacoes: string;
}

export function ConfiguracoesGerais() {
  const [configs, setConfigs] = useState<ConfiguracoesEmpresa>({
    nome_empresa: "Escritório de Advocacia",
    cnpj: "",
    endereco: "",
    telefone: "",
    email: "",
    responsavel_legal: "",
    observacoes: ""
  });

  const [salvando, setSalvando] = useState(false);

  const handleSalvar = async () => {
    setSalvando(true);
    
    try {
      // Simular salvamento (você pode implementar persistência no localStorage ou Supabase)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem('configuracoes_empresa', JSON.stringify(configs));
      
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSalvando(false);
    }
  };

  const handleInputChange = (field: keyof ConfiguracoesEmpresa, value: string) => {
    setConfigs(prev => ({ ...prev, [field]: value }));
  };

  // Carregar configurações salvas ao inicializar
  useState(() => {
    const configsSalvas = localStorage.getItem('configuracoes_empresa');
    if (configsSalvas) {
      try {
        const parsed = JSON.parse(configsSalvas);
        setConfigs(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Building2 className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Configurações Gerais</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Informações da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome_empresa">Nome da Empresa *</Label>
              <Input
                id="nome_empresa"
                value={configs.nome_empresa}
                onChange={(e) => handleInputChange('nome_empresa', e.target.value)}
                placeholder="Digite o nome da empresa"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={configs.cnpj}
                onChange={(e) => handleInputChange('cnpj', e.target.value)}
                placeholder="00.000.000/0000-00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço Completo</Label>
            <Input
              id="endereco"
              value={configs.endereco}
              onChange={(e) => handleInputChange('endereco', e.target.value)}
              placeholder="Rua, número, bairro, cidade, CEP"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={configs.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={configs.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contato@empresa.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsavel_legal">Responsável Legal</Label>
            <Input
              id="responsavel_legal"
              value={configs.responsavel_legal}
              onChange={(e) => handleInputChange('responsavel_legal', e.target.value)}
              placeholder="Nome do responsável legal"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={configs.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Observações adicionais sobre a empresa..."
              rows={3}
            />
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button 
              onClick={handleSalvar}
              disabled={salvando || !configs.nome_empresa.trim()}
            >
              <Save className="mr-2 h-4 w-4" />
              {salvando ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <Label className="font-semibold">Versão do Sistema</Label>
              <p className="text-muted-foreground">v1.0.0</p>
            </div>
            <div>
              <Label className="font-semibold">Última Atualização</Label>
              <p className="text-muted-foreground">{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <Label className="font-semibold">Ambiente</Label>
              <p className="text-muted-foreground">Produção</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}