import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Key, Plus, Edit, Trash2, UserCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: "admin" | "usuario" | "visualizador";
  status: "ativo" | "inativo";
  ultimo_acesso: string;
}

export function ControleAcesso() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    {
      id: "1",
      nome: "Administrador",
      email: "admin@escritorio.com",
      perfil: "admin",
      status: "ativo",
      ultimo_acesso: "2024-12-25"
    },
    {
      id: "2", 
      nome: "João Silva",
      email: "joao@escritorio.com",
      perfil: "usuario",
      status: "ativo",
      ultimo_acesso: "2024-12-24"
    },
    {
      id: "3",
      nome: "Maria Santos",
      email: "maria@escritorio.com", 
      perfil: "visualizador",
      status: "ativo",
      ultimo_acesso: "2024-12-23"
    }
  ]);

  const [novoUsuario, setNovoUsuario] = useState({
    nome: "",
    email: "",
    perfil: "" as "admin" | "usuario" | "visualizador" | ""
  });

  const [dialogAberto, setDialogAberto] = useState(false);

  const handleAdicionarUsuario = () => {
    if (!novoUsuario.nome || !novoUsuario.email || !novoUsuario.perfil) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const usuario: Usuario = {
      id: Date.now().toString(),
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      perfil: novoUsuario.perfil as "admin" | "usuario" | "visualizador",
      status: "ativo",
      ultimo_acesso: "Nunca"
    };

    setUsuarios([...usuarios, usuario]);
    setNovoUsuario({ nome: "", email: "", perfil: "" });
    setDialogAberto(false);
    toast.success("Usuário adicionado com sucesso!");
  };

  const handleRemoverUsuario = (id: string) => {
    if (usuarios.find(u => u.id === id)?.perfil === "admin" && usuarios.filter(u => u.perfil === "admin").length === 1) {
      toast.error("Não é possível remover o último administrador");
      return;
    }

    setUsuarios(usuarios.filter(u => u.id !== id));
    toast.success("Usuário removido com sucesso!");
  };

  const alternarStatus = (id: string) => {
    setUsuarios(usuarios.map(u => 
      u.id === id 
        ? { ...u, status: u.status === "ativo" ? "inativo" : "ativo" as "ativo" | "inativo" }
        : u
    ));
    toast.success("Status do usuário alterado!");
  };

  const getPerfilBadge = (perfil: string) => {
    switch (perfil) {
      case "admin":
        return <Badge className="bg-red-100 text-red-800">Administrador</Badge>;
      case "usuario":
        return <Badge className="bg-blue-100 text-blue-800">Usuário</Badge>;
      case "visualizador":
        return <Badge className="bg-green-100 text-green-800">Visualizador</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "ativo" 
      ? <Badge variant="default">Ativo</Badge>
      : <Badge variant="secondary">Inativo</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Controle de Acesso</h2>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Funcionalidade Demonstrativa:</strong> Este controle de usuários é apenas para demonstração. 
          Em produção, recomenda-se integração com sistemas de autenticação como Auth0, Firebase Auth ou similar.
        </AlertDescription>
      </Alert>

      {/* Resumo de Permissões */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{usuarios.filter(u => u.perfil === "admin").length}</div>
                <p className="text-sm text-muted-foreground">Administradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{usuarios.filter(u => u.perfil === "usuario").length}</div>
                <p className="text-sm text-muted-foreground">Usuários</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{usuarios.filter(u => u.perfil === "visualizador").length}</div>
                <p className="text-sm text-muted-foreground">Visualizadores</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários do Sistema
            </CardTitle>
            
            <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Usuário
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={novoUsuario.nome}
                      onChange={(e) => setNovoUsuario({...novoUsuario, nome: e.target.value})}
                      placeholder="Digite o nome completo"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={novoUsuario.email}
                      onChange={(e) => setNovoUsuario({...novoUsuario, email: e.target.value})}
                      placeholder="usuario@escritorio.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Perfil de Acesso *</Label>
                    <Select onValueChange={(value) => setNovoUsuario({...novoUsuario, perfil: value as any})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador - Acesso total</SelectItem>
                        <SelectItem value="usuario">Usuário - Criar e editar</SelectItem>
                        <SelectItem value="visualizador">Visualizador - Apenas leitura</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button onClick={handleAdicionarUsuario} className="w-full">
                    Adicionar Usuário
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {usuarios.map((usuario) => (
              <div key={usuario.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {usuario.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  
                  <div>
                    <div className="font-medium">{usuario.nome}</div>
                    <div className="text-sm text-muted-foreground">{usuario.email}</div>
                    <div className="text-xs text-muted-foreground">
                      Último acesso: {usuario.ultimo_acesso}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getPerfilBadge(usuario.perfil)}
                  {getStatusBadge(usuario.status)}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => alternarStatus(usuario.id)}
                  >
                    {usuario.status === "ativo" ? "Desativar" : "Ativar"}
                  </Button>
                  
                  {usuario.perfil !== "admin" || usuarios.filter(u => u.perfil === "admin").length > 1 ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoverUsuario(usuario.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Informações sobre Permissões */}
      <Card>
        <CardHeader>
          <CardTitle>Permissões por Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-red-600 mb-2">🔴 Administrador</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Acesso total ao sistema</li>
                <li>• Gerenciar usuários</li>
                <li>• Alterar configurações</li>
                <li>• Excluir dados</li>
                <li>• Exportar relatórios</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">🔵 Usuário</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Cadastrar contratos</li>
                <li>• Editar contratos</li>
                <li>• Ver relatórios</li>
                <li>• Gerenciar clientes</li>
                <li>• Exportar dados</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-green-600 mb-2">🟢 Visualizador</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Visualizar contratos</li>
                <li>• Ver relatórios</li>
                <li>• Consultar clientes</li>
                <li>• Exportar relatórios</li>
                <li>• Sem permissão de edição</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}