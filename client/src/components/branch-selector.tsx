import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Building2, Check, ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useState } from "react";

type Branch = {
  id: string;
  restaurantId: string;
  name: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  isMain: boolean;
  createdAt: string;
  updatedAt: string;
};

export function BranchSelector() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ['/api/branches'],
    enabled: !!user && user.role === 'admin',
  });

  const setActiveBranchMutation = useMutation({
    mutationFn: async (branchId: string) => {
      return await apiRequest('POST', '/api/auth/active-branch', { branchId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
      toast({
        title: "Sucesso",
        description: "Unidade alterada com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar unidade",
        variant: "destructive",
      });
    },
  });

  if (!user || user.role !== 'admin' || branches.length === 0) {
    return null;
  }

  const activeBranch = branches.find(b => b.id === user.activeBranchId);
  const activeBranchName = activeBranch?.name || "Selecione uma unidade";

  return (
    <div className="p-4 border-b border-sidebar-border">
      <p className="text-xs text-muted-foreground mb-2">Unidade Ativa</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            data-testid="button-branch-selector"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{activeBranchName}</span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Buscar unidade..." />
            <CommandList>
              <CommandEmpty>Nenhuma unidade encontrada.</CommandEmpty>
              <CommandGroup>
                {branches.map((branch) => (
                  <CommandItem
                    key={branch.id}
                    value={branch.name}
                    onSelect={() => {
                      setActiveBranchMutation.mutate(branch.id);
                      setOpen(false);
                    }}
                    data-testid={`option-branch-${branch.id}`}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        user.activeBranchId === branch.id
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{branch.name}</div>
                      {branch.address && (
                        <div className="text-xs text-muted-foreground truncate">
                          {branch.address}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
