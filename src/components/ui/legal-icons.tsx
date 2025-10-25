// Ícones específicos para o ambiente jurídico
import { 
  Scale, 
  Gavel, 
  FileText, 
  ShieldCheck, 
  Users, 
  Briefcase,
  BookOpen,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building,
  User,
  Settings,
  BarChart3,
  TrendingUp,
  Calculator,
  Search,
  Plus,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  X,
  Check,
  ChevronDown,
  ChevronRight,
  Filter,
  Home,
  FileCheck,
  Handshake,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  LogOut
} from "lucide-react";

// Mapeamento de ícones jurídicos
export const LegalIcons = {
  // Principais - Justiça
  justice: Scale,           // Balança da justiça
  court: Gavel,            // Martelo do juiz
  contract: FileText,       // Documentos/contratos
  compliance: ShieldCheck,  // Conformidade/segurança
  
  // Pessoas e organizações
  clients: Users,          // Clientes
  lawyer: Briefcase,       // Advogado/escritório
  firm: Building,          // Escritório/firma
  user: User,              // Usuário individual
  
  // Documentos e processos
  process: BookOpen,       // Processo jurídico
  document: FileText,      // Documento
  validated: FileCheck,    // Documento validado
  agreement: Handshake,    // Acordo
  
  // Tempo e status
  pending: Clock,          // Pendente/tempo
  completed: CheckCircle,  // Concluído
  warning: AlertTriangle,  // Alerta/atenção
  
  // Navegação e interface
  home: Home,              // Início
  dashboard: BarChart3,    // Painel de controle
  reports: TrendingUp,     // Relatórios
  calculations: Calculator, // Cálculos
  settings: Settings,      // Configurações
  search: Search,          // Busca
  
  // Ações
  add: Plus,               // Adicionar
  download: Download,      // Baixar
  upload: Upload,          // Enviar
  view: Eye,               // Visualizar
  edit: Edit,              // Editar
  delete: Trash2,          // Excluir
  close: X,                // Fechar
  confirm: Check,          // Confirmar
  filter: Filter,          // Filtrar
  logout: LogOut,          // Sair
  
  // Navegação
  expand: ChevronDown,     // Expandir
  collapse: ChevronRight,  // Recolher
  
  // Contato
  phone: Phone,            // Telefone
  email: Mail,             // Email
  address: MapPin,         // Endereço
  calendar: Calendar,      // Calendário
  money: DollarSign,       // Financeiro
} as const;

// Tipo para autocompletar
export type LegalIconName = keyof typeof LegalIcons;

// Componente para usar ícones jurídicos
interface LegalIconProps {
  name: LegalIconName;
  className?: string;
  size?: number;
}

export function LegalIcon({ name, className, size = 20 }: LegalIconProps) {
  const IconComponent = LegalIcons[name];
  return <IconComponent className={className} size={size} />;
}

// Hook para facilitar o uso
export function useLegalIcon(name: LegalIconName) {
  return LegalIcons[name];
}