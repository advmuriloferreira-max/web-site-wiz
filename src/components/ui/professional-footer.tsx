import React from "react";
import { Shield, Phone, Mail, MapPin, Clock, Database, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SecurityIndicator, ComplianceBadge, BackupIndicator } from "./security-indicators";

export function ProfessionalFooter() {
  const currentVersion = "v2.1.4";
  const lastUpdate = new Date().toLocaleDateString('pt-BR');
  
  return (
    <footer className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white py-8 mt-12 border-t-4 border-primary">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Informações da Empresa */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-accent" />
              <div>
                <h3 className="font-bold text-xl">INTELLBANK</h3>
                <p className="text-xs text-slate-300">Gestão de Passivo Bancário</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>São Paulo, SP - Brasil</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>(11) 9999-9999</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>contato@intellbank.com.br</span>
              </div>
            </div>
          </div>

          {/* Conformidade */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Conformidade</h4>
            <div className="space-y-3">
              <ComplianceBadge className="bg-green-900 border-green-700 text-green-100" />
              
              <div className="space-y-1 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span>Resolução BCB 352/2023</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span>Circular BCB 4.145/2023</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span>LGPD Compliance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Segurança */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Segurança</h4>
            <div className="space-y-3">
              <SecurityIndicator className="text-slate-300" />
              <BackupIndicator className="text-slate-300" />
              
              <div className="text-xs text-slate-300">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-3 w-3 text-blue-400" />
                  <span>Dados criptografados</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3 text-blue-400" />
                  <span>Auditoria completa</span>
                </div>
              </div>
            </div>
          </div>

          {/* Informações do Sistema */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Sistema</h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span>Versão:</span>
                <Badge variant="outline" className="text-white border-white">
                  {currentVersion}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Atualização:</span>
                <span>{lastUpdate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-slate-400" />
                <span>Horário: {new Date().toLocaleTimeString('pt-BR')}</span>
              </div>
            </div>
            
            <Separator className="bg-slate-700" />
            
            <div className="text-xs text-slate-400">
              <p>© 2024 INTELLBANK</p>
              <p>Todos os direitos reservados</p>
            </div>
          </div>
        </div>

        <Separator className="my-6 bg-slate-700" />

        {/* Disclaimer Legal */}
        <div className="text-xs text-slate-400 space-y-2">
          <p className="font-medium">
            DISCLAIMER: Este software é uma ferramenta de apoio ao cálculo de provisões conforme normativas do Banco Central do Brasil. 
            Os usuários são responsáveis pela validação dos dados inseridos e pela conformidade com as regulamentações aplicáveis.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-white transition-colors">Suporte Técnico</a>
            <a href="#" className="hover:text-white transition-colors">Documentação BCB</a>
          </div>
        </div>
      </div>
    </footer>
  );
}