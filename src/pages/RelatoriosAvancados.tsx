import { useEffect } from "react";

export default function RelatoriosAvancados() {
  useEffect(() => {
    console.log("RelatoriosAvancados component mounted successfully!");
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="bg-green-100 p-4 rounded-lg border border-green-300">
        <h1 className="text-3xl font-bold text-green-800">✅ Relatórios Avançados</h1>
        <p className="text-green-700 mt-2">
          Esta página está funcionando corretamente! Se você está vendo esta mensagem, 
          a rota foi configurada com sucesso.
        </p>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Status da Página:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>✅ Componente carregado</li>
          <li>✅ Rota /relatorios-avancados funcionando</li>
          <li>✅ Navigation sidebar configurada</li>
          <li>🔄 Próximo: Implementar Matriz de Migração de Risco</li>
        </ul>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-semibold text-yellow-800">Instruções:</h3>
        <p className="text-yellow-700 text-sm mt-1">
          Se você consegue ver esta página, significa que tudo está funcionando. 
          Agora posso implementar a funcionalidade completa da matriz de migração.
        </p>
      </div>
    </div>
  );
}