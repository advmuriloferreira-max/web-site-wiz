import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyStateIllustration } from './premium-illustrations';
import { InteractiveIcon } from './premium-icons';
import { Plus, Search, Filter, FileText, Users, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description: string;
  illustration?: 'documents' | 'users' | 'search' | 'filter' | 'calculations';
  actionLabel?: string;
  secondaryActionLabel?: string;
  onAction?: () => void;
  onSecondaryAction?: () => void;
  className?: string;
  animated?: boolean;
}

const illustrations = {
  documents: () => <EmptyStateIllustration size="lg" />,
  users: () => <EmptyStateIllustration size="lg" />,
  search: () => <EmptyStateIllustration size="lg" />,
  filter: () => <EmptyStateIllustration size="lg" />,
  calculations: () => <EmptyStateIllustration size="lg" />
};

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1] as any,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] as any
    }
  }
};

export function PremiumEmptyState({
  title,
  description,
  illustration = 'documents',
  actionLabel,
  secondaryActionLabel,
  onAction,
  onSecondaryAction,
  className,
  animated = true
}: EmptyStateProps) {
  const IllustrationComponent = illustrations[illustration];

  return (
    <motion.div
      className={cn('flex items-center justify-center min-h-[400px] p-8', className)}
      variants={animated ? containerVariants : undefined}
      initial={animated ? "hidden" : undefined}
      animate={animated ? "visible" : undefined}
    >
      <Card className="max-w-md w-full p-8 text-center bg-gradient-to-br from-background to-muted/20 border-2 border-dashed border-muted-foreground/20">
        <motion.div
          className="space-y-6"
          variants={animated ? itemVariants : undefined}
        >
          {/* Illustration */}
          <motion.div
            className="flex justify-center"
            variants={animated ? itemVariants : undefined}
          >
            <IllustrationComponent />
          </motion.div>

          {/* Content */}
          <motion.div
            className="space-y-3"
            variants={animated ? itemVariants : undefined}
          >
            <h3 className="text-xl font-semibold text-foreground">
              {title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {description}
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center"
            variants={animated ? itemVariants : undefined}
          >
            {actionLabel && onAction && (
              <Button
                onClick={onAction}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                {actionLabel}
              </Button>
            )}
            
            {secondaryActionLabel && onSecondaryAction && (
              <Button
                variant="outline"
                onClick={onSecondaryAction}
                size="lg"
                className="border-2 hover:bg-muted/50"
              >
                {secondaryActionLabel}
              </Button>
            )}
          </motion.div>

          {/* Helpful Tips */}
          <motion.div
            className="mt-8 p-4 bg-muted/50 rounded-lg border border-muted-foreground/10"
            variants={animated ? itemVariants : undefined}
          >
            <h4 className="text-sm font-medium text-foreground mb-2">
              💡 Dica
            </h4>
            <p className="text-xs text-muted-foreground">
              {getHelpfulTip(illustration)}
            </p>
          </motion.div>
        </motion.div>
      </Card>
    </motion.div>
  );
}

function getHelpfulTip(illustration: string): string {
  const tips = {
    documents: "Use templates pré-configurados para acelerar a criação de contratos e documentos.",
    users: "Importe dados de clientes em lote usando arquivos CSV ou conecte-se com seu CRM.",
    search: "Use filtros avançados e pesquisa por texto completo para encontrar informações rapidamente.",
    filter: "Combine múltiplos filtros para criar visões personalizadas dos seus dados.",
    calculations: "Configure parâmetros de cálculo personalizados para diferentes tipos de operação."
  };
  
  return tips[illustration as keyof typeof tips] || "Explore as funcionalidades disponíveis para começar.";
}

// Specialized empty states for common scenarios
export function EmptyDocumentsState({ onCreateDocument }: { onCreateDocument?: () => void }) {
  return (
    <PremiumEmptyState
      title="Nenhum documento encontrado"
      description="Comece criando seu primeiro contrato ou documento jurídico. Use nossos templates para acelerar o processo."
      illustration="documents"
      actionLabel="Criar Documento"
      secondaryActionLabel="Ver Templates"
      onAction={onCreateDocument}
      onSecondaryAction={() => {/* Handle templates */}}
    />
  );
}

export function EmptyClientsState({ onCreateClient }: { onCreateClient?: () => void }) {
  return (
    <PremiumEmptyState
      title="Nenhum cliente cadastrado"
      description="Cadastre seus primeiros clientes para começar a gerenciar contratos e processos de forma organizada."
      illustration="users"
      actionLabel="Cadastrar Cliente"
      secondaryActionLabel="Importar Clientes"
      onAction={onCreateClient}
      onSecondaryAction={() => {/* Handle import */}}
    />
  );
}

export function EmptySearchState({ onClearSearch }: { onClearSearch?: () => void }) {
  return (
    <PremiumEmptyState
      title="Nenhum resultado encontrado"
      description="Tente ajustar os termos de busca ou remover alguns filtros para expandir os resultados."
      illustration="search"
      actionLabel="Limpar Busca"
      secondaryActionLabel="Ver Todos"
      onAction={onClearSearch}
      onSecondaryAction={() => {/* Handle show all */}}
    />
  );
}

export function EmptyCalculationsState({ onCreateCalculation }: { onCreateCalculation?: () => void }) {
  return (
    <PremiumEmptyState
      title="Nenhum cálculo realizado"
      description="Execute cálculos de provisão, juros e valores de acordo usando nossa calculadora avançada."
      illustration="calculations"
      actionLabel="Nova Calculadora"
      secondaryActionLabel="Ver Exemplos"
      onAction={onCreateCalculation}
      onSecondaryAction={() => {/* Handle examples */}}
    />
  );
}