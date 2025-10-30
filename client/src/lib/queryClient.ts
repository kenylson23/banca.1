import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const errorData = await res.json();
      const error = new Error(errorData.message || res.statusText);
      Object.assign(error, errorData);
      throw error;
    } catch (e) {
      if (e instanceof Error && e.message) {
        throw e;
      }
      const text = (await res.text()) || res.statusText;
      throw new Error(`${res.status}: ${text}`);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    let url = queryKey[0] as string;
    
    if (queryKey.length > 1 && typeof queryKey[1] === 'object' && queryKey[1] !== null) {
      const params = new URLSearchParams();
      const queryParams = queryKey[1] as Record<string, any>;
      
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined && value !== null && value !== 'todos') {
          params.append(key, String(value));
        }
      }
      
      const queryString = params.toString();
      if (queryString) {
        url += '?' + queryString;
      }
    } else if (queryKey.length > 1) {
      url = queryKey.join("/") as string;
    }
    
    console.log('[QueryClient] Fetching URL:', url);
    
    const res = await fetch(url, {
      credentials: "include",
    });

    console.log('[QueryClient] Response status:', res.status, 'for URL:', url);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      console.log('[QueryClient] Returning null for 401');
      return null;
    }

    await throwIfResNotOk(res);
    const data = await res.json();
    console.log('[QueryClient] Response data:', data);
    return data;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
