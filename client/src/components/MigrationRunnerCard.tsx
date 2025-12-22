import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Database, Play, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MigrationResult {
  success: boolean;
  migration: string;
  executed: number;
  errors?: Array<{ statement: string; error: string }>;
  message: string;
}

export function MigrationRunnerCard() {
  const { toast } = useToast();
  const [migrationName, setMigrationName] = useState("add_performance_indexes");
  const [result, setResult] = useState<MigrationResult | null>(null);

  const runMigrationMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/admin/run-migration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ migrationName: name }),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to run migration");
      }

      return res.json();
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Migration Executada",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao Executar Migration",
        description: error.message,
      });
    },
  });

  const handleRunMigration = () => {
    if (!migrationName.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, insira o nome da migration",
      });
      return;
    }
    runMigrationMutation.mutate(migrationName);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Database className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <CardTitle>Migration Runner</CardTitle>
            <CardDescription>Executar migrations do banco de dados</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atenção!</AlertTitle>
          <AlertDescription>
            Execute migrations apenas uma vez. Execuções duplicadas são ignoradas automaticamente.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="migration-name">Nome da Migration (sem .sql)</Label>
          <Input
            id="migration-name"
            placeholder="add_performance_indexes"
            value={migrationName}
            onChange={(e) => setMigrationName(e.target.value)}
            disabled={runMigrationMutation.isPending}
          />
          <p className="text-xs text-muted-foreground">
            Arquivo: server/migrations/{migrationName}.sql
          </p>
        </div>

        <Button
          onClick={handleRunMigration}
          disabled={runMigrationMutation.isPending || !migrationName.trim()}
          className="w-full"
        >
          {runMigrationMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Executando...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Executar Migration
            </>
          )}
        </Button>

        {/* Result Display */}
        {result && (
          <div className="space-y-3">
            <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
              <div className="flex items-center gap-2 mb-2">
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
                <span className={`font-semibold ${result.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                  {result.success ? "Sucesso!" : "Erro"}
                </span>
              </div>
              
              <p className="text-sm mb-2">{result.message}</p>
              
              {result.success && (
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline">
                    Migration: {result.migration}
                  </Badge>
                  <Badge variant="outline">
                    Statements: {result.executed}
                  </Badge>
                </div>
              )}
            </div>

            {/* Errors */}
            {result.errors && result.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Alguns erros ocorreram</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 text-xs mt-2">
                    {result.errors.map((err, idx) => (
                      <li key={idx}>{err.error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Available Migrations */}
        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-medium mb-2">Migrations Disponíveis:</h4>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>• add_performance_indexes - 38 índices de performance</li>
            <li>• 0001_printer_configurations - Configurações de impressora</li>
            <li>• add_guest_number_to_table_guests - Número de convidado</li>
            <li>• add_order_number - Número de pedido</li>
            <li>• add_profile_image_url_to_users - Imagem de perfil</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
