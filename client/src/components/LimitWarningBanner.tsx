import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowUpCircle, Info } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

type LimitWarningBannerProps = {
  current: number;
  max: number;
  resourceName: string;
  resourceNamePlural: string;
  upgradeMessage?: string;
  className?: string;
};

export function LimitWarningBanner({
  current,
  max,
  resourceName,
  resourceNamePlural,
  upgradeMessage,
  className,
}: LimitWarningBannerProps) {
  const percentage = (current / max) * 100;
  const isAtLimit = current >= max;
  const isNearLimit = percentage >= 80 && percentage < 100;
  
  // Não mostrar nada se estiver muito abaixo do limite
  if (percentage < 80) {
    return null;
  }

  return (
    <Alert
      variant={isAtLimit ? "destructive" : "default"}
      className={cn(
        "rounded-xl shadow-sm",
        isAtLimit && "border-destructive/30 bg-destructive/[0.06]",
        isNearLimit && "border-amber-500/30 bg-amber-500/[0.06]",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {isAtLimit ? (
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        ) : (
          <Info className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
        )}
        <div className="flex-1 space-y-2">
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <AlertTitle className="mb-0">
              {isAtLimit
                ? `Limite de ${resourceNamePlural} atingido`
                : `Próximo ao limite de ${resourceNamePlural}`}
            </AlertTitle>
            <Badge
              variant={isAtLimit ? "destructive" : "secondary"}
              className={cn(
                "shrink-0",
                isNearLimit && "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300"
              )}
            >
              {current} / {max}
            </Badge>
          </div>
          <AlertDescription>
            {isAtLimit ? (
              <>
                Você já possui {current} {resourceNamePlural} e atingiu o limite do seu plano.{" "}
                {upgradeMessage || `Faça upgrade para adicionar mais ${resourceNamePlural}.`}
              </>
            ) : (
              <>
                Você está usando {current} de {max} {resourceNamePlural} disponíveis ({Math.round(percentage)}%).{" "}
                Considere fazer upgrade em breve para evitar interrupções.
              </>
            )}
          </AlertDescription>
          {isAtLimit && (
            <Link href="/subscription">
              <Button size="sm" variant={isAtLimit ? "destructive" : "default"} className="gap-2 mt-2">
                <ArrowUpCircle className="h-4 w-4" />
                Fazer Upgrade
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Alert>
  );
}
