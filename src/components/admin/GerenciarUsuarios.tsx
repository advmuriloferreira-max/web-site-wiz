import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePWANavigation } from "@/hooks/usePWANavigation";
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
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Users, Crown, Shield, User, Loader2 } from "lucide-react";
import { z } from "zod";

interface UserProfile {
  id: string;
  nome: string;
  email: string;
  role: string;
  created_at: string;
}

export function GerenciarUsuarios() {
  const { createUser, isAdmin, user } = useAuth();
  const { toast } = useToast();
  const { shareInviteLink } = usePWANavigation();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [convites, setConvites] = useState<any[]>([]);
  const [showConvites, setShowConvites] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchConvites();
    }
  }, [isAdmin]);

  const fetchConvites = async () => {
    try {
      const { data, error } = await supabase
        .from('convites')
        .select('*')
        .eq('usado', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConvites(data || []);
    } catch (error) {
      console.error('Error fetching convites:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, email, role, created_at')
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

  const handleCreateInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsCreating(true);

    const formData = new FormData(e.currentTarget);
    const conviteData = {
      nome: formData.get('nome') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as string
    };

    try {
      const validation = z.object({
        nome: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres'),
        email: z.string().email('Email inválido').trim(),
        role: z.enum(['admin', 'advogado', 'assistente'])
      }).parse(conviteData);

      // Chamar a edge function para criar o convite e enviar email
      const { data, error } = await supabase.functions.invoke('send-invite', {
        body: {
          email: validation.email,
          nome: validation.nome,
          role: validation.role,
          created_by: user?.id
        }
      });

      if (error) {
        console.error('Error calling send-invite function:', error);
        setError('Erro ao enviar convite: ' + error.message);
      } else if (data?.error) {
        setError(data.error);
      } else {
        toast({
          title: "Convite enviado!",
          description: `Convite enviado por email para ${validation.nome} (${validation.email})`,
        });
        
        setIsDialogOpen(false);
        fetchConvites();
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
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowConvites(!showConvites)}
            className="flex items-center gap-2"
          >
            📧 {showConvites ? 'Ocultar' : 'Ver'} Convites ({convites.length})
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Gerar Convite
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Gerar Convite de Acesso</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleCreateInvite} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email da Pessoa</Label>
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
                        Gerando Convite...
                      </>
                    ) : (
                      'Gerar Convite'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de Convites Pendentes */}
      {showConvites && convites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📧 Convites Pendentes ({convites.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {convites.map((convite) => (
                <div key={convite.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{convite.nome}</p>
                    <p className="text-sm text-muted-foreground">{convite.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Expira: {new Date(convite.expires_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRoleBadgeVariant(convite.role) as any}>
                      {getRoleLabel(convite.role)}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        await shareInviteLink(convite.token);
                        toast({ title: "Link copiado!", description: "Link do convite copiado para a área de transferência." });
                      }}
                    >
                      📋 Copiar Link
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                  <TableHead>Cadastrado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nome}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={getRoleBadgeVariant(user.role) as any}
                        className="flex items-center gap-1 w-fit"
                      >
                        {getRoleIcon(user.role)}
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
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