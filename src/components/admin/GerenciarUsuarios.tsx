import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateUserStatus, useUpdateUserRole, useDeleteUser } from "@/hooks/useUserManagement";
import { useValidacaoLimites } from "@/hooks/useValidacaoLimites";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Users, Crown, Shield, User, Loader2, Settings, Trash2, UserCheck, UserX } from "lucide-react";
import { z } from "zod";

interface UserProfile {
  id: string;
  nome: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export function GerenciarUsuarios() {
  const { createUser, isAdmin, user } = useAuth();
  const { toast } = useToast();
  const updateStatusMutation = useUpdateUserStatus();
  const updateRoleMutation = useUpdateUserRole();
  const deleteUserMutation = useDeleteUser();
  const { validarNovoUsuario } = useValidacaoLimites();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, email, role, status, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsCreating(true);

    const formData = new FormData(e.currentTarget);
    const userData = {
      nome: formData.get('nome') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      role: formData.get('role') as string
    };

    try {
      // Validar limite de usuários
      const podeAdicionar = await validarNovoUsuario();
      
      if (!podeAdicionar) {
        toast({
          title: "Limite atingido",
          description: "Você atingiu o limite de usuários do seu plano. Faça upgrade para adicionar mais.",
          variant: "destructive",
        });
        setIsCreating(false);
        return;
      }

      const validation = z.object({
        nome: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres'),
        email: z.string().email('Email inválido').trim(),
        password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
        role: z.enum(['admin', 'advogado', 'assistente'])
      }).parse(userData);

      const { error } = await createUser(
        validation.email, 
        validation.password, 
        validation.nome, 
        validation.role
      );

      if (error) {
        setError(error.message || 'Erro ao criar usuário');
      } else {
        toast({
          title: "Usuário criado!",
          description: `Usuário ${validation.nome} foi criado com sucesso`,
        });
        
        setIsDialogOpen(false);
        fetchUsers();
        (e.target as HTMLFormElement).reset();
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        console.error('Unexpected error:', err);
        setError('Erro inesperado. Tente novamente.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4" />;
      case 'advogado':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'advogado':
        return 'Advogado';
      case 'assistente':
        return 'Assistente';
      default:
        return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'advogado':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'ativo' ? 'default' : 'secondary';
  };

  const handleStatusChange = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo';
    updateStatusMutation.mutate({ userId, status: newStatus });
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'advogado' | 'assistente') => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.id) {
      toast({
        title: "Erro",
        description: "Você não pode excluir sua própria conta",
        variant: "destructive"
      });
      return;
    }
    deleteUserMutation.mutate(userId);
  };

  if (!isAdmin) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Apenas administradores podem gerenciar usuários.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Gerenciar Usuários</h2>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Cadastrar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  name="nome"
                  type="text"
                  placeholder="João Silva"
                  required
                  disabled={isCreating}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="joao.silva@escritorio.com"
                  required
                  disabled={isCreating}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  required
                  disabled={isCreating}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Função</Label>
                <Select name="role" required disabled={isCreating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assistente">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Assistente
                      </div>
                    </SelectItem>
                    <SelectItem value="advogado">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Advogado
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        Administrador
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isCreating}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isCreating}
                  className="flex-1"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando Usuário...
                    </>
                  ) : (
                    'Criar Usuário'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários da Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cadastrado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((currentUser) => (
                    <TableRow key={currentUser.id}>
                      <TableCell className="font-medium">{currentUser.nome}</TableCell>
                      <TableCell>{currentUser.email}</TableCell>
                      <TableCell>
                        <Select
                          value={currentUser.role}
                          onValueChange={(value) => handleRoleChange(currentUser.id, value as 'admin' | 'advogado' | 'assistente')}
                          disabled={updateRoleMutation.isPending || currentUser.id === user?.id}
                        >
                          <SelectTrigger className="w-fit">
                            <SelectValue>
                              <Badge 
                                variant={getRoleBadgeVariant(currentUser.role) as any}
                                className="flex items-center gap-1 w-fit"
                              >
                                {getRoleIcon(currentUser.role)}
                                {getRoleLabel(currentUser.role)}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="assistente">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Assistente
                              </div>
                            </SelectItem>
                            <SelectItem value="advogado">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Advogado
                              </div>
                            </SelectItem>
                            <SelectItem value="admin">
                              <div className="flex items-center gap-2">
                                <Crown className="h-4 w-4" />
                                Administrador
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(currentUser.id, currentUser.status)}
                          disabled={updateStatusMutation.isPending || currentUser.id === user?.id}
                          className="flex items-center gap-1"
                        >
                          {currentUser.status === 'ativo' ? (
                            <>
                              <UserX className="h-3 w-3" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3 w-3" />
                              Ativar
                            </>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        {new Date(currentUser.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={deleteUserMutation.isPending || currentUser.id === user?.id}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o usuário <strong>{currentUser.nome}</strong>? 
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(currentUser.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}