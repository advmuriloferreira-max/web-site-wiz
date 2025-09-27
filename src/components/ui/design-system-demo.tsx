import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glassmorphism";
import { GradientButton, GradientText } from "@/components/ui/gradient-elements";
import { PremiumBadge, StatusBadge } from "@/components/ui/premium-badges";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { 
  Palette, 
  Zap, 
  Shield, 
  Star,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle
} from "lucide-react";

export function DesignSystemDemo() {
  return (
    <div className="p-8 space-y-12 bg-gradient-hero min-h-screen">
      <div className="text-center">
        <GradientText variant="hero" className="text-4xl font-bold mb-4">
          Sistema de Design Premium
        </GradientText>
        <p className="text-muted-foreground text-lg">
          Componentes visuais elegantes e consistentes
        </p>
      </div>

      {/* Color Palette */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Paleta de Cores</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="space-y-2">
            <div className="h-16 bg-primary rounded-lg shadow-lg"></div>
            <p className="text-sm font-medium">Primary</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-secondary rounded-lg shadow-lg"></div>
            <p className="text-sm font-medium">Secondary</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-accent rounded-lg shadow-lg"></div>
            <p className="text-sm font-medium">Accent</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-success rounded-lg shadow-lg"></div>
            <p className="text-sm font-medium">Success</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-warning rounded-lg shadow-lg"></div>
            <p className="text-sm font-medium">Warning</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-destructive rounded-lg shadow-lg"></div>
            <p className="text-sm font-medium">Error</p>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Botões</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <GradientButton variant="primary" glow>
            <Zap className="mr-2 h-4 w-4" />
            Gradient Primary
          </GradientButton>
          <GradientButton variant="success">
            <CheckCircle className="mr-2 h-4 w-4" />
            Success
          </GradientButton>
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="interactive-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Card Padrão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Card tradicional com estilo padrão e animações suaves.
              </p>
            </CardContent>
          </Card>

          <GlassCard variant="light" hover>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">Glass Card</h3>
            </div>
            <p className="text-muted-foreground">
              Card com efeito glassmorphism e backdrop blur.
            </p>
          </GlassCard>

          <Card className="bg-gradient-card border-none text-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-warning" />
                Gradient Card
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="opacity-90">
                Card com background gradiente sutil e elegante.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Badges */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Badges e Status</h2>
        <div className="flex flex-wrap gap-4">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          
          <PremiumBadge variant="status" color="primary" icon={Info}>
            Info Premium
          </PremiumBadge>
          <PremiumBadge variant="status" color="success" icon={CheckCircle}>
            Success Premium
          </PremiumBadge>
          <PremiumBadge variant="status" color="warning" icon={AlertTriangle}>
            Warning Premium
          </PremiumBadge>
          <PremiumBadge variant="status" color="error" icon={XCircle}>
            Error Premium
          </PremiumBadge>
        </div>
        
        <div className="flex flex-wrap gap-4 mt-4">
          <StatusBadge status="active" />
          <StatusBadge status="pending" />
          <StatusBadge status="completed" />
          <StatusBadge status="error" />
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Tipografia</h2>
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold">Heading 1</h1>
            <GradientText variant="hero">Heading 1 com Gradiente</GradientText>
          </div>
          <div>
            <h2 className="text-3xl font-bold">Heading 2</h2>
            <GradientText variant="primary">Heading 2 com Gradiente</GradientText>
          </div>
          <div>
            <h3 className="text-2xl font-bold">Heading 3</h3>
            <GradientText variant="sunset">Heading 3 com Gradiente</GradientText>
          </div>
          <p className="text-body">
            Este é um parágrafo de texto corpo padrão com leading relaxado para melhor legibilidade.
          </p>
          <p className="text-caption">
            Este é um texto caption/legenda em tamanho menor.
          </p>
          <div className="text-numeric text-2xl font-bold">
            <AnimatedCounter value={1234567} prefix="R$ " /> 
          </div>
        </div>
      </section>

      {/* Animations Demo */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Animações</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="animate-fade-in">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="animate-pulse mb-4">
                  <div className="h-12 w-12 bg-primary rounded-full mx-auto"></div>
                </div>
                <p className="font-medium">Fade In</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="animate-slide-up">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="animate-bounce mb-4">
                  <div className="h-12 w-12 bg-success rounded-full mx-auto"></div>
                </div>
                <p className="font-medium">Slide Up</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="animate-scale-in">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="animate-spin-slow mb-4">
                  <div className="h-12 w-12 bg-accent rounded-full mx-auto"></div>
                </div>
                <p className="font-medium">Scale In</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}