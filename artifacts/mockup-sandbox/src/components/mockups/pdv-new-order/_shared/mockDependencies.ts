import { QueryClient } from "@tanstack/react-query";
import { z } from "zod";

export type InsertOrder = any;
export type Customer = any;
export type OptionGroup = any;
export type SelectedOption = any;

export const insertOrderSchema: any = {
  extend: () => z.any(),
};

export const sampleMenuItems = [
  { id: "bolo-rei", name: "Bolo Rei", price: "1200", categoryId: "doces", category: { id: "doces", name: "Doces" }, isAvailable: 1, optionGroups: [] },
  { id: "cafe-expresso", name: "Café Expresso", price: "500", categoryId: "bebidas", category: { id: "bebidas", name: "Bebidas" }, isAvailable: 1, optionGroups: [] },
  { id: "sumo-natural", name: "Sumo Natural", price: "900", categoryId: "bebidas", category: { id: "bebidas", name: "Bebidas" }, isAvailable: 1, optionGroups: [] },
  { id: "pastel-frango", name: "Pastel de Frango", price: "750", categoryId: "salgados", category: { id: "salgados", name: "Salgados" }, isAvailable: 1, optionGroups: [] },
  { id: "bolo-chocolate", name: "Bolo de Chocolate", price: "1500", categoryId: "doces", category: { id: "doces", name: "Doces" }, isAvailable: 1, optionGroups: [] },
  { id: "agua", name: "Água Mineral", price: "300", categoryId: "bebidas", category: { id: "bebidas", name: "Bebidas" }, isAvailable: 1, optionGroups: [] },
];

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const key = String(queryKey[0]);
        if (key === "/api/menu-items") return sampleMenuItems;
        if (key === "/api/auth/user") return { role: "admin", restaurantId: "preview-restaurant" };
        return [];
      },
      retry: false,
    },
  },
});

export const apiRequest = async (_method: string, _url: string, _data?: unknown) =>
  new Response(JSON.stringify({ id: "preview-order" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

export const indexedDB = {
  saveOrder: async (_order: unknown) => undefined,
  saveOrderItems: async (_items: unknown) => undefined,
};

export function formatKwanza(value: string | number) {
  const amount = Number(value) || 0;
  return `${new Intl.NumberFormat("pt-AO", { maximumFractionDigits: 0 }).format(amount)} Kz`;
}

export const ProductOptionsDialog = (_props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  basePrice: number;
  optionGroups: OptionGroup[];
  onConfirm: (options: SelectedOption[]) => void;
}) => null;
export const usePrinter = () => ({ getPrinterByType: (_type: string) => null });
export const printerService = {
  printKitchenOrder: async (_type: string, _order: unknown) => undefined,
};
