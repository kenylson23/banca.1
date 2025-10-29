import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface HealthCheck {
  status: string;
  environment: {
    nodeEnv: string;
    hasSessionSecret: boolean;
    hasDatabaseUrl: boolean;
    port: string;
  };
  session: {
    isAuthenticated: boolean;
    hasSession: boolean;
    sessionID: string;
  };
  database: {
    connected: boolean;
  };
  user?: {
    id: string;
    email: string;
    role: string;
    hasRestaurantId: boolean;
  };
  timestamp: string;
}

export function AuthDebugPanel() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [healthCheck, setHealthCheck] = useState<HealthCheck | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);

  // Only show in development or when DEBUG_AUTH is enabled
  const showDebug = import.meta.env.DEV || import.meta.env.VITE_DEBUG_AUTH === 'true';

  const fetchHealthCheck = async () => {
    setHealthLoading(true);
    setHealthError(null);
    try {
      const response = await fetch('/api/debug/health', {
        credentials: 'include',
      });
      if (!response.ok) {
        // Endpoint might be disabled in production for security
        if (response.status === 404) {
          setHealthError('Debug endpoint desabilitado. Configure DEBUG_AUTH=true no servidor para habilitar.');
        } else {
          throw new Error('Failed to fetch health check');
        }
        return;
      }
      const data = await response.json();
      setHealthCheck(data);
    } catch (error) {
      setHealthError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    if (showDebug) {
      fetchHealthCheck();
    }
  }, [showDebug]);

  if (!showDebug) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md" data-testid="debug-panel">
      <Card className="border-2 border-amber-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Painel de Diagnóstico
              </CardTitle>
              <CardDescription className="text-xs">
                Modo de Debug Ativo
              </CardDescription>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={fetchHealthCheck}
              disabled={healthLoading}
              data-testid="button-refresh-health"
            >
              <RefreshCw className={`h-4 w-4 ${healthLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {/* Frontend Auth Status */}
          <div>
            <div className="font-semibold mb-1">Frontend (useAuth):</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {isAuthenticated ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-500" />
                )}
                <span>Autenticado: {isAuthenticated ? 'Sim' : 'Não'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={user?.role ? 'default' : 'destructive'} className="text-xs">
                  Role: {user?.role || 'undefined'}
                </Badge>
              </div>
              {user && (
                <div className="text-muted-foreground">
                  ID: {user.id?.slice(0, 8)}...
                </div>
              )}
            </div>
          </div>

          {/* Backend Health Check */}
          {healthCheck && (
            <div>
              <div className="font-semibold mb-1">Backend (/api/debug/health):</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {healthCheck.session.isAuthenticated ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span>Sessão: {healthCheck.session.isAuthenticated ? 'Ativa' : 'Inativa'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {healthCheck.database.connected ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span>Database: {healthCheck.database.connected ? 'Conectado' : 'Desconectado'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {healthCheck.environment.hasSessionSecret ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span>SESSION_SECRET: {healthCheck.environment.hasSessionSecret ? 'OK' : 'FALTANDO'}</span>
                </div>
                {healthCheck.user && (
                  <div>
                    <Badge variant={healthCheck.user.role ? 'default' : 'destructive'} className="text-xs">
                      Backend Role: {healthCheck.user.role || 'undefined'}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          {healthError && (
            <Alert variant="destructive">
              <AlertDescription>{healthError}</AlertDescription>
            </Alert>
          )}

          {/* Problem Detection */}
          {isAuthenticated && !user?.role && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>PROBLEMA DETECTADO:</strong> Usuário autenticado mas role está undefined.
                O botão de Configurações não aparecerá.
              </AlertDescription>
            </Alert>
          )}

          {!isAuthenticated && healthCheck?.session.hasSession && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>PROBLEMA DETECTADO:</strong> Sessão existe mas autenticação falhou.
                Verifique cookies e SESSION_SECRET.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
