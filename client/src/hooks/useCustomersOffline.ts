/**
 * Custom hook for customer management (online only)
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from './use-toast';
import type { Customer } from '@shared/schema';

export function useCustomersOffline() {
  const { toast } = useToast();

  // Fetch customers (online only)
  const { data: customers, isLoading, refetch } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
    queryFn: async () => {
      const result = await apiRequest('GET', '/api/customers');
      return Array.isArray(result) ? result : [];
    },
    staleTime: 30000, // 30 seconds
  });

  // Ensure customers is always an array
  const safeCustomers = Array.isArray(customers) ? customers : [];

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      phone?: string;
      email?: string;
      address?: string;
      birthDate?: string;
      notes?: string;
      branchId?: string | null;
    }) => {
      return await apiRequest('POST', '/api/customers', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      refetch();
      toast({
        title: 'Sucesso',
        description: 'Cliente criado com sucesso',
      });
    },
    onError: (error: any) => {
      
      // Handle specific error codes from backend
      if (error.code === 'FEATURE_NOT_AVAILABLE') {
        toast({
          title: 'Funcionalidade Não Disponível',
          description: error.message || 'Esta funcionalidade não está disponível no seu plano atual.',
          variant: 'destructive',
        });
      } else if (error.code === 'LIMIT_REACHED') {
        toast({
          title: 'Limite Atingido',
          description: error.message || 'Você atingiu o limite de clientes do seu plano.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao criar cliente',
          variant: 'destructive',
        });
      }
    },
  });

  // Update customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, data }: {
      id: string;
      data: {
        name?: string;
        phone?: string;
        email?: string;
        address?: string;
        birthDate?: string;
        notes?: string;
        isActive?: number;
      };
    }) => {
      return await apiRequest('PUT', `/api/customers/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      refetch();
      toast({
        title: 'Sucesso',
        description: 'Cliente atualizado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar cliente',
        variant: 'destructive',
      });
    },
  });

  // Delete customer mutation
  const deleteCustomerMutation = useMutation({
    mutationFn: async (customerId: string) => {
      return await apiRequest('DELETE', `/api/customers/${customerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      refetch();
      toast({
        title: 'Sucesso',
        description: 'Cliente deletado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao deletar cliente',
        variant: 'destructive',
      });
    },
  });

  return {
    customers: safeCustomers,
    isLoading,
    isOnline: navigator.onLine,
    createCustomerMutation,
    updateCustomerMutation,
    deleteCustomerMutation,
    refetch,
  };
}
