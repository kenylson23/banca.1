import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Plus, Trash2, Save, AlertCircle, Check, Zap, Coffee, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface BusinessHour {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface BusinessHoursManagerProps {
  restaurantId: string;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Segunda-feira', short: 'Seg' },
  { value: 'tuesday', label: 'Terça-feira', short: 'Ter' },
  { value: 'wednesday', label: 'Quarta-feira', short: 'Qua' },
  { value: 'thursday', label: 'Quinta-feira', short: 'Qui' },
  { value: 'friday', label: 'Sexta-feira', short: 'Sex' },
  { value: 'saturday', label: 'Sábado', short: 'Sáb' },
  { value: 'sunday', label: 'Domingo', short: 'Dom' },
];

const DEFAULT_HOURS: BusinessHour[] = DAYS_OF_WEEK.map(day => ({
  day: day.value,
  isOpen: true,
  openTime: '09:00',
  closeTime: '22:00',
}));

// 🎯 FASE 1: PRESETS/TEMPLATES
const HOUR_PRESETS = {
  commercial: {
    name: 'Comercial',
    icon: Coffee,
    description: 'Seg-Sex 9h-18h',
    hours: DAYS_OF_WEEK.map((day, index) => ({
      day: day.value,
      isOpen: index < 5, // Segunda a Sexta
      openTime: '09:00',
      closeTime: '18:00',
    }))
  },
  lunchDinner: {
    name: 'Almoço/Jantar',
    icon: Sun,
    description: 'Almoço e jantar',
    hours: DAYS_OF_WEEK.map(day => ({
      day: day.value,
      isOpen: true,
      openTime: '12:00',
      closeTime: '23:00',
    }))
  },
  allDay: {
    name: '24 Horas',
    icon: Zap,
    description: 'Sempre aberto',
    hours: DAYS_OF_WEEK.map(day => ({
      day: day.value,
      isOpen: true,
      openTime: '00:00',
      closeTime: '23:59',
    }))
  },
};

export function BusinessHoursManager({ restaurantId }: BusinessHoursManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hours, setHours] = useState<BusinessHour[]>(DEFAULT_HOURS);
  const [isCurrentlyOpen, setIsCurrentlyOpen] = useState(true);

  // Fetch restaurant data
  const { data: restaurant } = useQuery<{ businessHours?: string; isOpen?: number }>({
    queryKey: [`/api/restaurants/${restaurantId}`],
  });

  // Initialize hours from restaurant data
  useEffect(() => {
    if (restaurant?.businessHours) {
      try {
        const parsed = JSON.parse(restaurant.businessHours);
        setHours(parsed);
      } catch (e) {
        console.error('Error parsing business hours:', e);
      }
    }
    if (restaurant?.isOpen !== undefined) {
      setIsCurrentlyOpen(restaurant.isOpen === 1);
    }
  }, [restaurant]);

  // Save business hours mutation
  const saveMutation = useMutation({
    mutationFn: async (data: { businessHours: string; isOpen: number }) => {
      const response = await fetch(`/api/restaurants/${restaurantId}/business-hours`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao salvar horários');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/restaurants/${restaurantId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/public/restaurants/${restaurantId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/public/restaurants'] });
      toast({
        title: 'Horários salvos!',
        description: 'Os horários de funcionamento foram atualizados.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar os horários.',
        variant: 'destructive',
      });
    },
  });

  // Toggle restaurant open/closed mutation
  const toggleOpenMutation = useMutation({
    mutationFn: async (isOpen: boolean) => {
      const response = await fetch(`/api/restaurants/${restaurantId}/toggle-open`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isOpen: isOpen ? 1 : 0 }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar status');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/restaurants/${restaurantId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/public/restaurants/${restaurantId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/public/restaurants'] });
      toast({
        title: variables ? 'Restaurante aberto' : 'Restaurante fechado',
        description: variables 
          ? 'O restaurante agora está aberto para pedidos.'
          : 'O restaurante agora está fechado para pedidos.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    },
  });

  const handleToggleDay = (dayIndex: number) => {
    const newHours = [...hours];
    newHours[dayIndex].isOpen = !newHours[dayIndex].isOpen;
    setHours(newHours);
  };

  const handleTimeChange = (dayIndex: number, field: 'openTime' | 'closeTime', value: string) => {
    const newHours = [...hours];
    newHours[dayIndex][field] = value;
    setHours(newHours);
  };

  const handleSave = () => {
    saveMutation.mutate({
      businessHours: JSON.stringify(hours),
      isOpen: isCurrentlyOpen ? 1 : 0,
    });
  };

  const handleToggleOpen = () => {
    const newStatus = !isCurrentlyOpen;
    setIsCurrentlyOpen(newStatus);
    toggleOpenMutation.mutate(newStatus);
  };

  const copyToAll = (sourceIndex: number) => {
    const sourceHour = hours[sourceIndex];
    const newHours = hours.map(h => ({
      ...h,
      openTime: sourceHour.openTime,
      closeTime: sourceHour.closeTime,
    }));
    setHours(newHours);
    toast({
      title: 'Horários copiados',
      description: 'Os horários foram aplicados a todos os dias.',
    });
  };

  // 🎯 FASE 1: APLICAR PRESET
  const applyPreset = (presetKey: keyof typeof HOUR_PRESETS) => {
    const preset = HOUR_PRESETS[presetKey];
    setHours(preset.hours);
    toast({
      title: `Template "${preset.name}" aplicado`,
      description: preset.description,
    });
  };

  // 🎯 FASE 1: VALIDAÇÃO VISUAL
  const validateHours = (hour: BusinessHour): { isValid: boolean; error?: string } => {
    if (!hour.isOpen) return { isValid: true };
    
    const [openH, openM] = hour.openTime.split(':').map(Number);
    const [closeH, closeM] = hour.closeTime.split(':').map(Number);
    
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;
    
    if (closeMinutes <= openMinutes) {
      return { isValid: false, error: 'Horário de fechamento deve ser após abertura' };
    }
    
    return { isValid: true };
  };

  // 🎯 FASE 1: CONTADOR DE HORAS
  const calculateTotalHours = (): { total: number; activeDays: number } => {
    let totalMinutes = 0;
    let activeDays = 0;
    
    hours.forEach(hour => {
      if (hour.isOpen) {
        activeDays++;
        const [openH, openM] = hour.openTime.split(':').map(Number);
        const [closeH, closeM] = hour.closeTime.split(':').map(Number);
        
        const openMinutes = openH * 60 + openM;
        const closeMinutes = closeH * 60 + closeM;
        
        if (closeMinutes > openMinutes) {
          totalMinutes += closeMinutes - openMinutes;
        }
      }
    });
    
    return {
      total: Math.round((totalMinutes / 60) * 10) / 10,
      activeDays
    };
  };

  const { total: totalHours, activeDays } = calculateTotalHours();

  return (
    <div className="space-y-1.5">
      {/* Current Status Card - Compacto */}
      <Card>
        <CardHeader className="pb-1.5">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <Clock className="h-3.5 w-3.5" />
              Status
            </CardTitle>
            {isCurrentlyOpen ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-green-600 dark:text-green-400">Aberto</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 border border-destructive/20 rounded-full">
                <div className="w-1.5 h-1.5 bg-destructive rounded-full" />
                <span className="text-xs font-semibold text-destructive">Fechado</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-1.5">
          <div className="flex items-center justify-between p-1.5 bg-muted/50 rounded border">
            <div className="flex items-center gap-1.5">
              <p className="font-medium text-xs">
                {isCurrentlyOpen ? 'Aceitar Pedidos' : 'Pausar Pedidos'}
              </p>
            </div>
            <Switch
              checked={isCurrentlyOpen}
              onCheckedChange={handleToggleOpen}
              disabled={toggleOpenMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Business Hours Configuration */}
      <Card>
        <CardHeader className="pb-1.5">
          <CardTitle className="flex items-center gap-1.5 text-sm">
            <Clock className="h-3.5 w-3.5" />
            Horários
          </CardTitle>
          <CardDescription className="text-xs">
            Configure os horários de funcionamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* 🎯 FASE 1: PRESETS/TEMPLATES */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Templates Rápidos</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {Object.entries(HOUR_PRESETS).map(([key, preset]) => {
                const Icon = preset.icon;
                return (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(key as keyof typeof HOUR_PRESETS)}
                    className="h-auto py-2 px-2 flex flex-col items-center gap-1 hover:bg-primary/5 hover:border-primary/50"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-semibold">{preset.name}</span>
                    <span className="text-[9px] text-muted-foreground">{preset.description}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* 🎯 FASE 1: CONTADOR DE HORAS */}
          <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium">Resumo Semanal</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="font-semibold text-primary">
                {totalHours}h
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                {activeDays} {activeDays === 1 ? 'dia' : 'dias'}
              </span>
            </div>
          </div>

          {/* Horários por Dia */}
          <div className="space-y-1">
          {hours.map((hour, index) => {
            const validation = validateHours(hour);
            const hasError = !validation.isValid;
            
            return (
            <div
              key={hour.day}
              className={`p-1.5 rounded border transition-colors ${
                hasError
                  ? 'border-destructive/50 bg-destructive/5'
                  : hour.isOpen 
                  ? 'border-border bg-card' 
                  : 'border-border/50 bg-muted/20'
              }`}
            >
              <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                {/* Day Toggle */}
                <div className="flex items-center gap-1 min-w-[90px]">
                  <Switch
                    checked={hour.isOpen}
                    onCheckedChange={() => handleToggleDay(index)}
                    className="scale-75"
                  />
                  <Label className="font-medium cursor-pointer" onClick={() => handleToggleDay(index)}>
                    {DAYS_OF_WEEK[index].short}
                  </Label>
                </div>

                {/* Time Inputs */}
                {hour.isOpen ? (
                  <>
                    <input
                      type="time"
                      value={hour.openTime}
                      onChange={(e) => handleTimeChange(index, 'openTime', e.target.value)}
                      className={`h-6 px-1 border rounded text-[10px] bg-background focus:outline-none focus:ring-1 w-20 ${
                        hasError 
                          ? 'border-destructive focus:ring-destructive' 
                          : 'border-input focus:ring-ring'
                      }`}
                    />
                    <span className="text-muted-foreground">-</span>
                    <input
                      type="time"
                      value={hour.closeTime}
                      onChange={(e) => handleTimeChange(index, 'closeTime', e.target.value)}
                      className={`h-6 px-1 border rounded text-[10px] bg-background focus:outline-none focus:ring-1 w-20 ${
                        hasError 
                          ? 'border-destructive focus:ring-destructive' 
                          : 'border-input focus:ring-ring'
                      }`}
                    />
                    {/* 🎯 FASE 1: VALIDAÇÃO VISUAL */}
                    {hasError && (
                      <div className="flex items-center gap-1 text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        <span className="text-[9px]">{validation.error}</span>
                      </div>
                    )}
                    {!hasError && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToAll(index)}
                        className="h-6 px-1.5 text-[9px]"
                        title="Copiar para todos os dias"
                      >
                        📋
                      </Button>
                    )}
                  </>
                ) : (
                  <span className="text-muted-foreground italic">Fechado</span>
                )}
              </div>
            </div>
          );
          })}
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-1.5">
            {/* Validation Status */}
            <div className="flex items-center gap-1.5">
              {hours.some(h => !validateHours(h).isValid) ? (
                <div className="flex items-center gap-1 text-destructive text-[10px]">
                  <AlertCircle className="h-3 w-3" />
                  <span>Corrija os erros antes de salvar</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-green-600 text-[10px]">
                  <Check className="h-3 w-3" />
                  <span>Horários válidos</span>
                </div>
              )}
            </div>
            
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending || hours.some(h => !validateHours(h).isValid)}
              size="sm"
              className="h-7"
            >
              <Save className="h-2.5 w-2.5 mr-1" />
              <span className="text-[10px]">{saveMutation.isPending ? 'Salvando...' : 'Salvar'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
