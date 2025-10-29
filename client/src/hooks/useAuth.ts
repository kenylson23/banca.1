// Blueprint: javascript_log_in_with_replit - useAuth hook
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Debug log for troubleshooting authentication issues
  // Only runs in development or when DEBUG_AUTH environment variable is set
  if (import.meta.env.DEV || import.meta.env.VITE_DEBUG_AUTH === 'true') {
    console.log('[useAuth] User data:', user);
    console.log('[useAuth] Is loading:', isLoading);
    console.log('[useAuth] Error:', error);
    console.log('[useAuth] Is authenticated:', !!user);
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
