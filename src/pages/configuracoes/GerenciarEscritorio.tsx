import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Users, 
  CreditCard, 
  Settings, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Shield,
  Trash2,
  UserPlus,
  Edit2,
  Save,
  X
} from "lucide-react";
import { useEscritorio, useUsuariosEscritorio, useUpdateEscritorio, useUpdateUsuarioEscritorio, useDeleteUsuarioEscritorio } from "@/hooks/useEscritorio";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

export default function GerenciarEscritorio() {
  const { data: escritorio, isLoading: loadingEscritorio } = useEscritorio();
  const { data: usuarios, isLoading: loadingUsuarios } = useUsuariosEscritorio();
  const updateEscritorio = useUpdateEscritorio();
  const updateUsuario = useUpdateUsuarioEscritorio();
  const deleteUsuario = useDeleteUsuarioEscritorio();

  const [editingEscritorio, setEditingEscritorio] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    email: "",
    telefone: "",
    endereco: "",
  });

  const handleEditEscritorio = () => {
    if (escritorio) {
      setFormData({
        nome: escritorio.nome,
        cnpj: escritorio.cnpj || "",
        email: escritorio.email,
        telefone: escritorio.telefone || "",
        endereco: escritorio.endereco || "",
      });
      setEditingEscritorio(true);
    }
  };

  const handleSaveEscritorio = async () => {
    if (escritorio) {
      await updateEscritorio.mutateAsync({
        id: escritorio.id,
        ...formData,
      });
      setEditingEscritorio(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo';
    await updateUsuario.mutateAsync({
      id: userId,
      status: newStatus,
    });
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Tem certeza que deseja remover este usuário?")) {
      await deleteUsuario.mutateAsync(userId);
    }
  };

  if (loadingEscritorio) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!escritorio) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Nenhum escritório encontrado. Você precisa estar associado a um escritório para acessar esta página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: "default",
      suspenso: "secondary",
      cancelado: "destructive",
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || "default"}>{status}</Badge>;
  };

  const getPlanoBadge = (plano: string) => {
    return (
      <Badge variant={plano === 'premium' ? 'default' : 'secondary'}>
        {plano === 'premium' ? '⭐ Premium' : 'Essencial'}
      </Badge>
    );
  };

  const diasRestantes = escritorio.data_vencimento 
    ? Math.ceil((new Date(escritorio.data_vencimento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            Gerenciar Escritório
          </h1>
          <p className="text-muted-foreground">
            Configure e gerencie as informações do seu escritório
          </p>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">
            <Settings className="h-4 w-4 mr-2" />
            Informações
          </TabsTrigger>
          <TabsTrigger value="usuarios">
            <Users className="h-4 w-4 mr-2" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="plano">
            <CreditCard className="h-4 w-4 mr-2" />
            Plano
          </TabsTrigger>
        </TabsList>

        {/* Aba: Informações do Escritório */}
        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Dados do Escritório</CardTitle>
                {!editingEscritorio ? (
                  <Button onClick={handleEditEscritorio} variant="outline" size="sm">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSaveEscritorio} size="sm" disabled={updateEscritorio.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                    <Button onClick={() => setEditingEscritorio(false)} variant="outline" size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {editingEscritorio ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome do Escritório</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      value={formData.cnpj}
                      onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Textarea
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span>Nome</span>
                    </div>
                    <p className="font-medium">{escritorio.nome}</p>
                  </div>
                  
                  {escritorio.cnpj && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        <span>CNPJ</span>
                      </div>
                      <p className="font-medium">{escritorio.cnpj}</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </div>
                    <p className="font-medium">{escritorio.email}</p>
                  </div>
                  
                  {escritorio.telefone && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>Telefone</span>
                      </div>
                      <p className="font-medium">{escritorio.telefone}</p>
                    </div>
                  )}
                  
                  {escritorio.endereco && (
                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Endereço</span>
                      </div>
                      <p className="font-medium">{escritorio.endereco}</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Data de Cadastro</span>
                    </div>
                    <p className="font-medium">
                      {new Date(escritorio.data_cadastro).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>Status</span>
                    </div>
                    <div>{getStatusBadge(escritorio.status)}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba: Usuários */}
        <TabsContent value="usuarios" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Usuários do Escritório</CardTitle>
                  <CardDescription>
                    {usuarios?.length || 0} de {escritorio.limite_usuarios} usuários
                  </CardDescription>
                </div>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Convidar Usuário
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingUsuarios ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Permissões</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios?.map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell className="font-medium">{usuario.nome}</TableCell>
                        <TableCell>{usuario.email}</TableCell>
                        <TableCell>{usuario.cargo || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={usuario.status === 'ativo' ? 'default' : 'secondary'}>
                            {usuario.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {usuario.permissoes.admin && <Badge variant="destructive">Admin</Badge>}
                            {usuario.permissoes.write && <Badge>Escrita</Badge>}
                            {usuario.permissoes.read && <Badge variant="outline">Leitura</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleUserStatus(usuario.id, usuario.status)}
                            >
                              {usuario.status === 'ativo' ? 'Desativar' : 'Ativar'}
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Remover Usuário</DialogTitle>
                                  <DialogDescription>
                                    Tem certeza que deseja remover {usuario.nome}? Esta ação não pode ser desfeita.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline">Cancelar</Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleDeleteUser(usuario.id)}
                                  >
                                    Remover
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba: Plano */}
        <TabsContent value="plano" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plano de Assinatura</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Plano Atual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getPlanoBadge(escritorio.plano)}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Vencimento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">
                      {escritorio.data_vencimento 
                        ? new Date(escritorio.data_vencimento).toLocaleDateString('pt-BR')
                        : "-"}
                    </p>
                    {diasRestantes > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {diasRestantes} dias restantes
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Limites</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p>👥 {escritorio.limite_usuarios} usuários</p>
                    <p>👤 {escritorio.limite_clientes} clientes</p>
                    <p>📄 {escritorio.limite_contratos} contratos</p>
                  </CardContent>
                </Card>
              </div>

              {diasRestantes <= 7 && diasRestantes > 0 && (
                <Alert>
                  <AlertDescription>
                    ⚠️ Seu plano vence em {diasRestantes} dias. Renove agora para não perder acesso!
                  </AlertDescription>
                </Alert>
              )}

              {diasRestantes <= 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    ❌ Seu plano está vencido. Renove agora para recuperar o acesso completo.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button size="lg">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Renovar Plano
                </Button>
                {escritorio.plano === 'essencial' && (
                  <Button variant="outline" size="lg">
                    ⭐ Fazer Upgrade para Premium
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
