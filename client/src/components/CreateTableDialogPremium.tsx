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
    <Button 
      size="sm" 
      className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/50 hover:shadow-xl transition-all duration-300 font-semibold"
    >
      <Plus className="h-4 w-4 mr-2" />
      Nova Mesa
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white dark:text-neutral-900" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Criar Nova Mesa</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Configure todos os detalhes da mesa
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 🎯 Feature 1 & 7: Preview Visual */}
          {(tableNumber || capacity) && (
            <div className="rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 shadow-sm p-6 flex flex-col items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Preview da Mesa
              </p>
              <div className="relative">
                <TableShapeIcon shape={shape} capacity={capacity} />
                {tableNumber && (
                  <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center text-xs font-bold shadow-lg">
                    #{tableNumber}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {parseInt(capacity) <= 2 && '🔵 Mesa Redonda (Ideal para casais)'}
                {parseInt(capacity) > 2 && parseInt(capacity) <= 4 && '⬜ Mesa Quadrada (Ideal para pequenos grupos)'}
                {parseInt(capacity) > 4 && '▭ Mesa Retangular (Ideal para grupos grandes)'}
              </p>
            </div>
          )}

          {/* 🎯 Feature 3: Smart suggestion */}
          {!tableNumber && (
            <div className="rounded-lg border-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Próximo número disponível: <span className="font-bold">{suggestedNumber}</span>
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setTableNumber(String(suggestedNumber))}
                  className="border-neutral-900 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-900 hover:text-white dark:hover:bg-neutral-800 font-medium"
                >
                  Usar
                </Button>
              </div>
            </div>
          )}

          {/* Number input with validation */}
          <div className="space-y-3">
            <Label htmlFor="table-number" className="text-base font-bold flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-neutral-900 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold text-white dark:text-neutral-300">
                1
              </div>
              Número da Mesa
            </Label>
            <div className="relative">
              <Input
                id="table-number"
                type="number"
                placeholder="Ex: 1, 2, 3..."
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                min="1"
                className={`h-12 text-lg pr-10 transition-all ${
                  tableNumber && tableExists 
                    ? 'border-red-500 focus-visible:ring-red-500' 
                    : tableNumber 
                    ? 'border-green-500 focus-visible:ring-green-500'
                    : ''
                }`}
              />
              {/* 🎯 Feature 2: Validation indicator */}
              {tableNumber && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {tableExists ? (
                    <X className="h-5 w-5 text-red-500" />
                  ) : (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                </div>
              )}
            </div>
            {/* Real-time feedback */}
            {tableNumber && tableExists && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-in slide-in-from-left-2">
                <X className="h-4 w-4" />
                Mesa #{tableNumber} já existe
              </p>
            )}
            {tableNumber && !tableExists && (
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 animate-in slide-in-from-left-2">
                <Check className="h-4 w-4" />
                Mesa #{tableNumber} disponível
              </p>
            )}
          </div>

          {/* Capacity with quick buttons */}
          <div className="space-y-3">
            <Label htmlFor="capacity" className="text-base font-bold flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-neutral-900 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold text-white dark:text-neutral-300">
                2
              </div>
              Capacidade
              <Badge variant="secondary" className="ml-auto text-xs">
                Ctrl+1 a 4 para atalhos
              </Badge>
            </Label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[2, 4, 6, 8].map((cap, idx) => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => setCapacity(String(cap))}
                  className={`h-12 rounded-lg border-2 text-sm font-semibold transition-all hover:scale-105 active:scale-95 ${
                    capacity === String(cap)
                      ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-md'
                      : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  {cap} <span className="text-xs opacity-70">pessoas</span>
                  <div className="text-[10px] opacity-50 mt-0.5">Ctrl+{idx + 1}</div>
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
              className="h-11"
            />
          </div>

          {/* 🎯 Feature 4: Area selector with icons */}
          <div className="space-y-3">
            <Label htmlFor="area" className="text-base font-bold flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-neutral-900 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold text-white dark:text-neutral-300">
                3
              </div>
              Área (Opcional)
            </Label>
            
            {existingAreas.length > 0 ? (
              <Select value={area} onValueChange={setArea}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecione uma área existente ou digite nova" />
                </SelectTrigger>
                <SelectContent>
                  {existingAreas.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a === 'Salão' && '🏠 '}
                      {a === 'Terraço' && '🌳 '}
                      {a === 'VIP' && '⭐ '}
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
                placeholder="Ex: Salão Principal, Terraço, VIP..."
                value={area === '__custom__' ? '' : area}
                onChange={(e) => setArea(e.target.value)}
                className="h-11"
              />
            )}
          </div>

          {/* 🎯 Feature 5: Advanced options (expandable) */}
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>⚙️ Configurações Avançadas</span>
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {showAdvanced && (
              <div className="mt-4 space-y-4 animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">Mesa Reservável</p>
                    <p className="text-xs text-muted-foreground">Permitir reservas online</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isReservable}
                    onChange={(e) => setIsReservable(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300"
                  />
                </div>
                
                <div className="p-3 rounded-lg border bg-muted/50">
                  <p className="font-medium text-sm mb-2">Formato da Mesa</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'round', label: '🔵 Redonda', desc: '≤2 pessoas' },
                      { value: 'square', label: '⬜ Quadrada', desc: '3-4 pessoas' },
                      { value: 'rectangle', label: '▭ Retangular', desc: '5+ pessoas' },
                    ].map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setShape(s.value as any)}
                        className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${
                          shape === s.value
                            ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                            : 'border-neutral-200 dark:border-neutral-700'
                        }`}
                      >
                        <div>{s.label}</div>
                        <div className="text-[10px] opacity-70 mt-1">{s.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info card */}
          <div className="rounded-lg border-2 border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 shadow-sm p-4">
            <div className="flex gap-3">
              <div className="h-6 w-6 rounded-full bg-neutral-800 dark:bg-neutral-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="h-3 w-3 text-white dark:text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm text-neutral-700 dark:text-neutral-300">
                <p className="font-medium mb-1">💡 Dicas Rápidas:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Pressione <kbd className="px-1 py-0.5 rounded bg-neutral-300 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100">Enter</kbd> para criar</li>
                  <li>• Use <kbd className="px-1 py-0.5 rounded bg-neutral-300 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100">Ctrl+1-4</kbd> para capacidades rápidas</li>
                  <li>• <kbd className="px-1 py-0.5 rounded bg-neutral-300 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100">Esc</kbd> para fechar</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
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
              className="flex-1 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900"
            >
              {createMutation.isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Mesa
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
