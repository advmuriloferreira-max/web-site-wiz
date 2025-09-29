import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, LogOut, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function UserMenu() {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso."
    });
  };

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/10 transition-all duration-200 hover:scale-105">
          <Avatar className="h-8 w-8 ring-2 ring-blue-400/20 hover:ring-blue-400/40 transition-all duration-200">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium text-sm">
              {profile?.nome ? getInitials(profile.nome) : <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 border-2 border-slate-800 rounded-full" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-64 bg-slate-900/95 backdrop-blur-sm border-slate-700/50 shadow-xl" 
        align="end" 
        forceMount
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 ring-2 ring-blue-400/30">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                {profile?.nome ? getInitials(profile.nome) : <User className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium text-white leading-none">
                {profile?.nome || 'Usuário'}
              </p>
              <p className="text-xs text-slate-400 leading-none">
                {user?.email}
              </p>
              {profile?.cargo && (
                <p className="text-xs text-blue-400 leading-none font-medium">
                  {profile.cargo}
                </p>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700/50" />
        <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-800/50 cursor-pointer transition-colors duration-200">
          <Settings className="mr-3 h-4 w-4 text-slate-400" />
          <span>Configurações</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-slate-700/50" />
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer transition-colors duration-200"
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}