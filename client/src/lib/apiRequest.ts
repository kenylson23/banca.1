/**
 * Helper para fazer requisições à API com suporte a guest token
 * 
 * Funciona em TODOS os planos:
 * - Plano Básico: Envia guest token no header
 * - Plano Profissional+: Envia customerId + guest token
 */
import { apiFetch } from "./api-url";

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  headers?: Record<string, string>;
  guestToken?: string;
}

export async function apiRequestWithToken(
  method: RequestMethod,
  url: string,
  data?: any,
  options?: RequestOptions
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  // Adicionar guest token ao header se fornecido
  if (options?.guestToken) {
    headers['X-Guest-Token'] = options.guestToken;
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: 'include', // Para incluir cookies de sessão
  };

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  const response = await apiFetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro na requisição' }));
    throw new Error(error.message || `Erro ${response.status}`);
  }

  return response;
}
