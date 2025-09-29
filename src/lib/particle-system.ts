import { RefObject } from 'react';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  opacity: number;
  type: 'dot' | 'star' | 'confetti' | 'connection';
}

export class ParticleSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationId: number | null = null;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private isRunning: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.setupCanvas();
    this.bindEvents();
  }

  private setupCanvas() {
    const updateSize = () => {
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width * window.devicePixelRatio;
      this.canvas.height = rect.height * window.devicePixelRatio;
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
  }

  private bindEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mouseenter', () => {
      this.addMouseTrailParticles();
    });
  }

  // Background particles for hero sections
  createBackgroundParticles(count: number = 50) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: 1,
        maxLife: 1,
        size: Math.random() * 2 + 1,
        color: `hsl(${220 + Math.random() * 40}, 70%, ${60 + Math.random() * 20}%)`,
        opacity: Math.random() * 0.3 + 0.1,
        type: 'dot'
      });
    }
  }

  // Success confetti effect
  createConfetti(centerX: number, centerY: number, count: number = 30) {
    const colors = [
      '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', 
      '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8E8'
    ];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const velocity = Math.random() * 8 + 4;
      
      this.particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - Math.random() * 3,
        life: 1,
        maxLife: 1,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1,
        type: 'confetti'
      });
    }
  }

  // Loading particles with connections
  createLoadingParticles(count: number = 20) {
    this.particles = []; // Clear existing particles
    
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 1,
        maxLife: 1,
        size: Math.random() * 3 + 2,
        color: 'hsl(var(--primary))',
        opacity: 0.8,
        type: 'connection'
      });
    }
  }

  // Mouse trail particles
  private addMouseTrailParticles() {
    if (this.particles.length > 100) return; // Limit particles

    this.particles.push({
      x: this.mouseX,
      y: this.mouseY,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      life: 30,
      maxLife: 30,
      size: Math.random() * 3 + 1,
      color: 'hsl(var(--primary))',
      opacity: 0.6,
      type: 'dot'
    });
  }

  private updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Update life for temporary particles
      if (particle.type !== 'connection') {
        particle.life--;
        particle.opacity = particle.life / particle.maxLife;
      }
      
      // Gravity for confetti
      if (particle.type === 'confetti') {
        particle.vy += 0.2;
        particle.vx *= 0.99;
      }
      
      // Wrap around for background particles
      if (particle.type === 'dot' && particle.life === particle.maxLife) {
        if (particle.x < 0) particle.x = this.canvas.width;
        if (particle.x > this.canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = this.canvas.height;
        if (particle.y > this.canvas.height) particle.y = 0;
      }
      
      // Remove dead particles
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private drawParticles() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw connections for loading particles
    if (this.particles.some(p => p.type === 'connection')) {
      this.drawConnections();
    }
    
    // Draw particles
    this.particles.forEach(particle => {
      this.ctx.save();
      this.ctx.globalAlpha = particle.opacity;
      
      if (particle.type === 'confetti') {
        this.drawConfettiParticle(particle);
      } else {
        this.drawDotParticle(particle);
      }
      
      this.ctx.restore();
    });
  }

  private drawDotParticle(particle: Particle) {
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.ctx.fillStyle = particle.color;
    this.ctx.fill();
    
    // Add glow effect
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
    this.ctx.fillStyle = particle.color.replace(')', ', 0.1)').replace('hsl(', 'hsla(');
    this.ctx.fill();
  }

  private drawConfettiParticle(particle: Particle) {
    this.ctx.save();
    this.ctx.translate(particle.x, particle.y);
    this.ctx.rotate(particle.life * 0.1);
    
    this.ctx.fillStyle = particle.color;
    this.ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size / 3);
    
    this.ctx.restore();
  }

  private drawConnections() {
    const connectionParticles = this.particles.filter(p => p.type === 'connection');
    
    for (let i = 0; i < connectionParticles.length; i++) {
      for (let j = i + 1; j < connectionParticles.length; j++) {
        const p1 = connectionParticles[i];
        const p2 = connectionParticles[j];
        
        const distance = Math.sqrt(
          Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
        );
        
        if (distance < 100) {
          this.ctx.save();
          this.ctx.globalAlpha = 0.3 * (1 - distance / 100);
          this.ctx.strokeStyle = 'hsl(var(--primary))';
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
          this.ctx.restore();
        }
      }
    }
  }

  private animate = () => {
    if (!this.isRunning) return;
    
    this.updateParticles();
    this.drawParticles();
    this.animationId = requestAnimationFrame(this.animate);
  };

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  destroy() {
    this.stop();
    this.particles = [];
  }
}