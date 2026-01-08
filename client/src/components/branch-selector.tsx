import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Building2, Check, ChevronsUpDown, Circle, CheckCircle2, X, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSidebar } from "@/components/ui/sidebar";
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

type BranchStatus = {
  value: 'online' | 'offline' | 'maintenance';
  label: string;
  color: string;
  glowColor: string;
  icon: React.ReactNode;
};

const BRANCH_STATUS_OPTIONS: BranchStatus[] = [
  {
    value: 'online',
    label: 'Online',
    color: 'from-emerald-500 to-green-600',
    glowColor: 'shadow-emerald-500/50',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  {
    value: 'offline',
    label: 'Offline',
    color: 'from-red-500 to-rose-600',
    glowColor: 'shadow-red-500/50',
    icon: <X className="w-4 h-4" />,
  },
  {
    value: 'maintenance',
    label: 'Manutenção',
    color: 'from-amber-500 to-orange-600',
    glowColor: 'shadow-amber-500/50',
    icon: <Pause className="w-4 h-4" />,
  },
];

export function BranchSelector() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { open: sidebarOpen } = useSidebar();
  const [open, setOpen] = useState(false);
  // Estado do status (simulado - pode ser integrado com API real)
  const [branchStatus, setBranchStatus] = useState<'online' | 'offline' | 'maintenance'>('online');

  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ['/api/branches'],
    enabled: !!user && user.role === 'admin',
  });

  const setActiveBranchMutation = useMutation({
    mutationFn: async (branchId: string) => {
      return await apiRequest('PATCH', '/api/auth/active-branch', { branchId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
      queryClient.invalidateQueries({ queryKey: ['/api/menu-items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
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
  const currentStatus = BRANCH_STATUS_OPTIONS.find(s => s.value === branchStatus) || BRANCH_STATUS_OPTIONS[0];

  return (
    <div className={`p-4 ${!sidebarOpen ? 'flex justify-center' : ''}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                aria-label={sidebarOpen ? undefined : `Unidade ativa: ${activeBranchName}`}
                size={sidebarOpen ? "default" : "icon"}
                className={sidebarOpen ? "w-full justify-between" : ""}
                data-testid="button-branch-selector"
              >
                {sidebarOpen ? (
                  <>
                    <div className="flex items-center gap-3 overflow-hidden">
                      {/* Avatar circular com iniciais */}
                      <div className="flex aspect-square size-9 items-center justify-center rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-bold text-xs shadow-md flex-shrink-0">
                        {activeBranchName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <span className="truncate block font-semibold">{activeBranchName}</span>
                        {activeBranch?.city && (
                          <span className="truncate block text-[11px] text-muted-foreground">
                            {activeBranch.city}{activeBranch?.state && ` · ${activeBranch.state}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </>
                ) : (
                  <div className="flex aspect-square size-9 items-center justify-center rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-bold text-xs shadow-md">
                    {activeBranchName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                  </div>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          {!sidebarOpen && (
            <TooltipContent side="right" className="font-semibold">
              {activeBranchName}
            </TooltipContent>
          )}
        </Tooltip>
        <PopoverContent className="w-[260px] p-0 rounded-xl shadow-xl bg-sidebar border-sidebar-border">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-sidebar"
          >
            {/* Status Control Section - Compact */}
            <div className="p-3 border-b border-sidebar-border">
              <div className="text-[10px] font-semibold text-sidebar-foreground/60 mb-2 uppercase tracking-wide">
                Status
              </div>
              
              <div className="flex gap-1.5">
                {BRANCH_STATUS_OPTIONS.map((status, index) => (
                  <motion.button
                    key={status.value}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setBranchStatus(status.value)}
                    className={`
                      flex-1
                      px-2 py-2
                      rounded-lg
                      flex flex-col items-center gap-1
                      transition-all duration-200
                      ${
                        branchStatus === status.value
                          ? `bg-gradient-to-r ${status.color} text-white shadow-md ${status.glowColor}`
                          : 'bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-foreground/70'
                      }
                    `}
                    title={status.label}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {status.icon}
                    </div>

                    {/* Label - smaller */}
                    <div className="text-[9px] font-semibold leading-tight">
                      {status.label}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Branch Selector Section */}
            <Command className="rounded-none bg-sidebar border-0">
              <CommandInput 
                placeholder="Buscar..." 
                className="h-9 border-0 border-b border-sidebar-border rounded-none bg-sidebar text-sidebar-foreground placeholder:text-sidebar-foreground/40" 
              />
              <CommandList className="max-h-[200px] bg-sidebar">
                <CommandEmpty className="py-4 text-center text-xs text-sidebar-foreground/60">
                  Nenhuma unidade encontrada.
                </CommandEmpty>
                <CommandGroup className="p-1.5">
                  {branches.map((branch, index) => (
                    <motion.div
                      key={branch.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index + 3) * 0.05 }}
                    >
                      <CommandItem
                        value={branch.name}
                        onSelect={() => {
                          setActiveBranchMutation.mutate(branch.id);
                          setOpen(false);
                        }}
                        data-testid={`option-branch-${branch.id}`}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg aria-selected:bg-sidebar-accent hover:bg-sidebar-accent cursor-pointer mb-0.5 last:mb-0"
                      >
                        {/* Avatar circular com iniciais - Compact */}
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-sidebar-primary/80 to-sidebar-primary text-sidebar-primary-foreground font-bold text-[10px] flex-shrink-0 shadow-sm">
                          {branch.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate text-xs text-sidebar-foreground">
                            {branch.name}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {/* Status indicator compact */}
                            <motion.span
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className={`inline-block size-1.5 rounded-full ${
                                branchStatus === 'online' ? 'bg-green-500' :
                                branchStatus === 'offline' ? 'bg-red-500' :
                                'bg-amber-500'
                              }`}
                            />
                            <span className={`text-[9px] font-medium ${
                              branchStatus === 'online' ? 'text-green-600 dark:text-green-400' :
                              branchStatus === 'offline' ? 'text-red-600 dark:text-red-400' :
                              'text-amber-600 dark:text-amber-400'
                            }`}>
                              {currentStatus.label}
                            </span>
                          </div>
                        </div>
                        
                        {user.activeBranchId === branch.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            <Check className="h-3.5 w-3.5 text-sidebar-foreground flex-shrink-0" strokeWidth={3} />
                          </motion.div>
                        )}
                      </CommandItem>
                    </motion.div>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </motion.div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
