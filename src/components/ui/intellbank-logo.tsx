import { BarChart3 } from "lucide-react";

export function IntelliLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-900 dark:bg-gray-800">
        <BarChart3 className="h-6 w-6 text-white" />
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
          INTELLBANK
        </span>
        <span className="text-xs text-gray-600 dark:text-gray-400">
          Direito Bancário
        </span>
      </div>
    </div>
  );
}
