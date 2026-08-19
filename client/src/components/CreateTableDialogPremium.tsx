import { useState, useEffect, useMemo } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Plus, Check, X, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Table {
  id: string;
  number: number;
  capacity: number;
  area?: string;
}

interface CreateTableDialogPremiumProps {
  trigger?: React.ReactNode;
  onTableCreated?: () => void;
}

export function CreateTableDialogPremium({ trigger, onTableCreated }: CreateTableDialogPremiumProps) {
  const [open, setOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState('');
  const [area, setArea] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [shape, setShape] = useState<'round' | 'square' | 'rectangle'>('square');
  const [isReservable, setIsReservable] = useState(true);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing tables
  const { data: tables = [] } = useQuery<Table[]>({
    queryKey: ['/api/tables'],
  });

  // 🎯 Feature 2: Real-time validation
  const tableExists = useMemo(() => {
    if (!tableNumber) return false;
    return tables.some(t => t.number === parseInt(tableNumber));
  }, [tableNumber, tables]);

  // 🎯 Feature 3: Smart number suggestion
  const suggestedNumber = useMemo(() => {
    if (tables.length === 0) return 1;
    
    // Find gaps in sequence
    const numbers = tables.map(t => t.number).sort((a, b) => a - b);
    for (let i = 1; i <= numbers.length; i++) {
      if (!numbers.includes(i)) return i;
    }
    
    // No gaps, return next
    return Math.max(...numbers) + 1;
  }, [tables]);

  // 🎯 Feature 4: Extract unique areas from existing tables
  const existingAreas = useMemo(() => {
    const areas = tables
      .map(t => t.area)
      .filter((a): a is string => !!a);
    return [...new Set(areas)];
  }, [tables]);

  // 🎯 Feature 6: Auto-fill suggestion on open
  useEffect(() => {
    if (open && !tableNumber) {
      setTableNumber(String(suggestedNumber));
    }
  }, [open, suggestedNumber]);

  // 🎯 Feature 1: Dynamic shape based on capacity
  useEffect(() => {
    const cap = parseInt(capacity);
    if (!cap) return;
    
    if (cap <= 2) setShape('round');
    else if (cap <= 4) setShape('square');
    else setShape('rectangle');
  }, [capacity]);

  // Create table mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          number: parseInt(tableNumber),
          capacity: parseInt(capacity),
          area: area || null,
          shape,
          isReservable,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar mesa');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
      toast({
        title: '🎉 Mesa criada com sucesso!',
        description: `Mesa #${tableNumber} adicionada à planta`,
      });
      
      // Reset form
      setTableNumber('');
      setCapacity('');
      setArea('');
      setShowAdvanced(false);
      setOpen(false);
      
      onTableCreated?.();
    },
    onError: (error: Error) => {
      toast({
        title: '❌ Erro ao criar mesa',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // 🎯 Feature 8: Keyboard shortcuts
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Enter to submit
      if (e.key === 'Enter' && !createMutation.isPending && tableNumber && capacity && !tableExists) {
        e.preventDefault();
        createMutation.mutate();
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        setOpen(false);
      }
      
      // Numbers 1-4 for quick capacity selection
      if (['1', '2', '3', '4'].includes(e.key) && e.ctrlKey) {
        e.preventDefault();
        const caps = [2, 4, 6, 8];
        setCapacity(String(caps[parseInt(e.key) - 1]));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, tableNumber, capacity, tableExists, createMutation]);

  // 🎯 Feature 1: Table shape icon
  const TableShapeIcon = ({ shape, capacity }: { shape: string; capacity: string }) => {
    const cap = parseInt(capacity) || 0;
    
    if (cap <= 2) {
      return (
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {capacity || '?'}
        </div>
      );
    } else if (cap <= 4) {
      return (
        <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {capacity || '?'}
        </div>
      );
    } else {
      return (
        <div className="h-16 w-20 rounded-md bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {capacity || '?'}
        </div>
      );
    }
  };

  const defaultTrigger = (
    <Button size="sm" className="gap-2">
      <Plus className="h-4 w-4" />
      Nova Mesa
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
       <DialogContent className="sm:max-w-md">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2">
             <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
               <Plus className="h-4 w-4 text-primary" />
             </div>
             Criar Nova Mesa
           </DialogTitle>
           <p className="text-sm text-muted-foreground">
             Número, capacidade e área
           </p>
         </DialogHeader>

         <div className="space-y-4 py-4">
           {/* Number input */}
           <div className="space-y-2">
             <Label htmlFor="table-number">Número da Mesa</Label>
             <Input
               id="table-number"
               type="number"
               placeholder="Ex: 1"
               value={tableNumber}
               onChange={(e) => setTableNumber(e.target.value)}
               min="1"
               className={`h-10 ${tableNumber && tableExists ? 'border-destructive' : tableNumber ? 'border-green-500' : ''}`}
             />
             {tableNumber && tableExists && (
               <p className="text-xs text-destructive">Mesa #{tableNumber} já existe</p>
             )}
           </div>

           {/* Capacity */}
           <div className="space-y-2">
             <Label htmlFor="capacity">Capacidade</Label>
             <div className="grid grid-cols-4 gap-2">
               {[2, 4, 6, 8].map((cap) => (
                 <button
                   key={cap}
                   type="button"
                   onClick={() => setCapacity(String(cap))}
                   className={`h-10 rounded-md border text-sm font-medium transition-colors ${
                     capacity === String(cap)
                       ? 'border-primary bg-primary text-primary-foreground'
                       : 'border-input hover:bg-accent'
                   }`}
                 >
                   {cap}
                 </button>
               ))}
             </div>
             <Input
               id="capacity"
               type="number"
               placeholder="Ou digite personalizado..."
               value={capacity}
               onChange={(e) => setCapacity(e.target.value)}
               min="1"
               className="h-10"
             />
           </div>

           {/* Area */}
           <div className="space-y-2">
             <Label htmlFor="area">Área (opcional)</Label>
             {existingAreas.length > 0 ? (
               <Select value={area} onValueChange={setArea}>
                 <SelectTrigger className="h-10">
                   <SelectValue placeholder="Selecione uma área" />
                 </SelectTrigger>
                 <SelectContent>
                   {existingAreas.map((a) => (
                     <SelectItem key={a} value={a}>
                       {a}
                     </SelectItem>
                   ))}
                   <SelectItem value="__custom__">+ Nova área...</SelectItem>
                 </SelectContent>
               </Select>
             ) : null}
             {(area === '__custom__' || existingAreas.length === 0) && (
               <Input
                 type="text"
                 placeholder="Ex: Salão Principal, Terraço..."
                 value={area === '__custom__' ? '' : area}
                 onChange={(e) => setArea(e.target.value)}
                 className="h-10"
               />
             )}
           </div>
         </div>

         <div className="flex gap-2">
           <Button
             type="button"
             variant="outline"
             onClick={() => {
               setTableNumber('');
               setCapacity('');
               setArea('');
             }}
             disabled={createMutation.isPending}
             className="flex-1"
           >
             Limpar
           </Button>
           <Button 
             onClick={() => createMutation.mutate()}
             disabled={createMutation.isPending || !tableNumber || !capacity || tableExists}
             className="flex-1"
           >
             {createMutation.isPending ? 'Criando...' : 'Criar Mesa'}
           </Button>
         </div>
       </DialogContent>
    </Dialog>
  );
}
