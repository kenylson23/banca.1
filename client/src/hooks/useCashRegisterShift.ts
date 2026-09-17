import { useQuery } from '@tanstack/react-query';

export const NO_OPEN_CASH_REGISTER_MESSAGE =
  'O pagamento não pode ser registrado porque não existe um turno de caixa aberto. Abra um turno para continuar.';

type CashRegisterShift = {
  id: string;
  status: 'aberto' | 'fechado' | string;
};

export function useCashRegisterShift() {
  const query = useQuery<CashRegisterShift[]>({
    queryKey: ['/api/cash-register-shifts', { status: 'aberto' }],
    staleTime: 0,
    refetchInterval: 15000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  });

  const hasOpenShift = (query.data || []).some((shift) => shift.status === 'aberto');

  return {
    ...query,
    hasOpenShift,
    paymentsBlocked: query.isLoading || !hasOpenShift,
  };
}