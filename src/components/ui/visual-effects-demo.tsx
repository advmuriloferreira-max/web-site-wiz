import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Import our new effect components
import { 
  HeroParticleBackground, 
  LoadingParticles, 
  SuccessConfetti, 
  ParticleCanvasRef 
} from './particle-effects';
import { 
  AdvancedGlassmorphism, 
  MultiLayerGlass, 
  GlassNavigation 
} from './advanced-glassmorphism';
import { 
  GlowEffect, 
  MouseShadowCaster, 
  AmbientLighting, 
  SpotlightEffect, 
  NeonEffect,
  HolographicEffect 
} from './lighting-effects';
import { 
  MorphingButton, 
  MorphingIcon, 
  MorphingContainer, 
  MorphingNumber, 
  MorphingCard,
  MorphingShape 
} from './morphing-elements';

export function VisualEffectsDemo() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [buttonSuccess, setButtonSuccess] = useState(false);
  const [expandedCard, setExpandedCard] = useState(false);
  const [iconState, setIconState] = useState<'play' | 'pause'>('play');
  const [likeState, setLikeState] = useState<'like' | 'liked'>('like');
  const [numberValue, setNumberValue] = useState(1000);

  const handleMorphingButtonClick = () => {
    setButtonLoading(true);
    
    setTimeout(() => {
      setButtonLoading(false);
      setButtonSuccess(true);
      setShowConfetti(true);
      
      setTimeout(() => {
        setButtonSuccess(false);
      }, 3000);
    }, 2000);
  };

  const triggerNumberChange = () => {
    setNumberValue(prev => prev + Math.floor(Math.random() * 5000) + 1000);
  };

  return (
    <div className="space-y-12 p-6 min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      
      {/* Success Confetti */}
      <SuccessConfetti 
        trigger={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />

      {/* Hero Section with Particle Background */}
      <section className="relative">
        <HeroParticleBackground className="rounded-3xl p-12 text-center">
          <AmbientLighting>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Efeitos Visuais Avançados
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Partículas, glassmorphism, iluminação e morphing elements em ação
              </p>
            </motion.div>
          </AmbientLighting>
        </HeroParticleBackground>
      </section>

      {/* Particle Effects Demo */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Particle Effects</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="relative overflow-hidden">
            <CardHeader>
              <CardTitle>Loading com Partículas Conectadas</CardTitle>
            </CardHeader>
            <CardContent>
              <LoadingParticles />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Confetti de Sucesso</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowConfetti(true)}
                className="w-full"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Trigger Confetti
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Glassmorphism Demo */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Advanced Glassmorphism</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AdvancedGlassmorphism variant="frost" animated>
            <div className="p-6">
              <h3 className="font-semibold mb-2">Frost Effect</h3>
              <p className="text-sm text-muted-foreground">
                Efeito de vidro fosco com múltiplas camadas de blur e padrões de frost.
              </p>
            </div>
          </AdvancedGlassmorphism>

          <MultiLayerGlass layers={3}>
            <div className="p-6">
              <h3 className="font-semibold mb-2">Multi-Layer Glass</h3>
              <p className="text-sm text-muted-foreground">
                Múltiplas camadas de glassmorphism com profundidade visual.
              </p>
            </div>
          </MultiLayerGlass>

          <AdvancedGlassmorphism variant="premium" gradient reflection>
            <div className="p-6">
              <h3 className="font-semibold mb-2">Premium Glass</h3>
              <p className="text-sm text-muted-foreground">
                Glassmorphism premium com gradientes animados e reflexos.
              </p>
            </div>
          </AdvancedGlassmorphism>
        </div>
      </section>

      {/* Lighting Effects Demo */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Lighting Effects</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlowEffect intensity="strong" color="primary">
            <Card className="p-6 text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Glow Effect</h3>
            </Card>
          </GlowEffect>

          <MouseShadowCaster>
            <Card className="p-6 text-center h-full">
              <Star className="w-8 h-8 mx-auto mb-2 text-secondary" />
              <h3 className="font-semibold">Mouse Shadows</h3>
            </Card>
          </MouseShadowCaster>

          <SpotlightEffect>
            <Card className="p-6 text-center h-full">
              <Heart className="w-8 h-8 mx-auto mb-2 text-accent" />
              <h3 className="font-semibold">Spotlight</h3>
            </Card>
          </SpotlightEffect>

          <NeonEffect intensity="medium" color="primary">
            <Card className="p-6 text-center h-full border-primary/50">
              <div className="w-8 h-8 mx-auto mb-2 bg-primary rounded-full" />
              <h3 className="font-semibold">Neon Glow</h3>
            </Card>
          </NeonEffect>
        </div>

        <div className="flex justify-center">
          <HolographicEffect className="p-8 rounded-2xl">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Holographic Effect</h3>
              <p className="text-muted-foreground">Efeito holográfico futurista</p>
            </div>
          </HolographicEffect>
        </div>
      </section>

      {/* Morphing Elements Demo */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Morphing Elements</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Morphing Button */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Morphing Button</CardTitle>
            </CardHeader>
            <CardContent>
              <MorphingButton
                loading={buttonLoading}
                success={buttonSuccess}
                onClick={handleMorphingButtonClick}
                className="w-full"
              >
                Processar
              </MorphingButton>
            </CardContent>
          </Card>

          {/* Morphing Icons */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Morphing Icons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center space-x-4">
                <button onClick={() => setIconState(iconState === 'play' ? 'pause' : 'play')}>
                  <MorphingIcon state={iconState} size={32} />
                </button>
                <button onClick={() => setLikeState(likeState === 'like' ? 'liked' : 'like')}>
                  <MorphingIcon state={likeState} size={32} />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Morphing Numbers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Morphing Numbers</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold mb-4">
                R$ <MorphingNumber value={numberValue} prefix="" suffix="" />
              </div>
              <Button size="sm" onClick={triggerNumberChange}>
                Atualizar Valor
              </Button>
            </CardContent>
          </Card>

          {/* Expandable Container */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Expandable Container</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                size="sm" 
                onClick={() => setExpandedCard(!expandedCard)}
                className="mb-2 w-full"
              >
                {expandedCard ? 'Recolher' : 'Expandir'}
              </Button>
              
              <MorphingContainer expanded={expandedCard} expandedHeight={120}>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm">
                    Este conteúdo se expande suavemente quando ativado, 
                    criando uma transição fluida e natural.
                  </p>
                </div>
              </MorphingContainer>
            </CardContent>
          </Card>
        </div>

        {/* Morphing Card */}
        <div className="flex justify-center">
          <MorphingCard
            expandOnHover
            className="w-80"
            hoverContent={
              <Card className="h-full bg-primary text-primary-foreground">
                <CardContent className="p-6 flex items-center justify-center h-full">
                  <div className="text-center">
                    <Star className="w-12 h-12 mx-auto mb-2" />
                    <h3 className="text-xl font-bold">Transformado!</h3>
                    <p>O card mudou completamente no hover</p>
                  </div>
                </CardContent>
              </Card>
            }
          >
            <Card className="h-40">
              <CardContent className="p-6 flex items-center justify-center h-full">
                <div className="text-center">
                  <Heart className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <h3 className="font-semibold">Morphing Card</h3>
                  <p className="text-sm text-muted-foreground">Passe o mouse aqui</p>
                </div>
              </CardContent>
            </Card>
          </MorphingCard>
        </div>

        {/* Morphing Shapes */}
        <div className="flex justify-center space-x-4">
          {(['circle', 'square', 'rounded', 'pill'] as const).map((shape) => (
            <MorphingShape
              key={shape}
              shape={shape}
              className="w-16 h-16 bg-primary flex items-center justify-center text-primary-foreground font-bold cursor-pointer"
            >
              {shape[0].toUpperCase()}
            </MorphingShape>
          ))}
        </div>
      </section>

      {/* Glass Navigation Demo */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Glass Navigation</h2>
        
        <div className="flex justify-center">
          <GlassNavigation className="max-w-md">
            <div className="flex space-x-4">
              {['Home', 'Sobre', 'Contato', 'Blog'].map((item) => (
                <button
                  key={item}
                  className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </GlassNavigation>
        </div>
      </section>
    </div>
  );
}