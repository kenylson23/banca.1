import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  UsersThree, 
  CurrencyCircleDollar, 
  Clock as ClockIcon,
  Receipt,
  Gear,
  GridFour as GridIcon,
  ListBullets as ListIcon,
  MagnifyingGlass,
  Plus,
  ArrowsHorizontal,
  ArrowsVertical,
  AlignLeft,
  AlignCenterHorizontal,
  AlignRight,
  AlignTop,
  AlignCenterVertical,
  AlignBottom,
  Palette
} from '@phosphor-icons/react';
import { formatKwanza } from '@/lib/formatters';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { TableDetailsDialog } from './TableDetailsDialog';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import type { Table } from '@shared/schema';
import { cn } from '@/lib/utils';

interface RestaurantFloorPlanProps {
  className?: string;
}

type ViewMode = 'floor' | 'grid';
type TableShape = 'round' | 'square' | 'rectangle';

// Helper to determine table shape based on capacity
const getTableShape = (capacity: number | null): TableShape => {
  if (!capacity) return 'square';
  if (capacity <= 2) return 'round'; // Small tables - round
  if (capacity <= 4) return 'square'; // Medium tables - square
  return 'rectangle'; // Large tables - rectangle
};

// Helper to get table dimensions based on shape and capacity
const getTableDimensions = (shape: TableShape, capacity: number | null) => {
  const baseSize = capacity && capacity > 4 ? 140 : capacity && capacity > 2 ? 128 : 112;
  
  switch (shape) {
    case 'round':
      return { width: baseSize, height: baseSize, borderRadius: '50%' };
    case 'square':
      return { width: baseSize, height: baseSize, borderRadius: '1rem' };
    case 'rectangle':
      return { width: baseSize + 32, height: baseSize - 16, borderRadius: '1rem' };
    default:
      return { width: 128, height: 128, borderRadius: '1rem' };
  }
};

// Helper to get deterministic default position for tables without saved position
const getDefaultPosition = (tableId: string, index: number, total: number) => {
  // Calculate grid layout
  const cols = Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / cols);
  
  const row = Math.floor(index / cols);
  const col = index % cols;
  
  // Distribute tables evenly in grid (15% margin on each side = 70% usable area)
  const usableWidth = 70;
  const usableHeight = 70;
  const startX = 15;
  const startY = 15;
  
  const x = startX + (col / Math.max(cols - 1, 1)) * usableWidth;
  const y = startY + (row / Math.max(rows - 1, 1)) * usableHeight;
  
  return { x, y };
};

export function RestaurantFloorPlan({ className }: RestaurantFloorPlanProps) {
  const { toast } = useToast();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('floor');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [draggedTableId, setDraggedTableId] = useState<string | null>(null);
  const [dragPreviewPosition, setDragPreviewPosition] = useState<{ x: number; y: number } | null>(null);
  const [alignmentGuides, setAlignmentGuides] = useState<{
    vertical: number[];
    horizontal: number[];
  }>({ vertical: [], horizontal: [] });
  const [hasCollision, setHasCollision] = useState(false);
  const [collisionTableIds, setCollisionTableIds] = useState<string[]>([]);
  const [magnetismActive, setMagnetismActive] = useState(false);
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);
  const [colorTheme, setColorTheme] = useState<'default' | 'modern' | 'elegant' | 'vibrant' | 'minimal'>('default');
  const floorPlanRef = useRef<HTMLDivElement>(null);

  // Alignment tolerance in percentage (how close to trigger alignment)
  const ALIGNMENT_TOLERANCE = 2; // 2% tolerance for smart guides
  
  // Collision detection tolerance in percentage
  const COLLISION_TOLERANCE = 8; // 8% overlap threshold to consider collision
  
  // Magnetism settings (in pixels, not percentage)
  const MAGNETISM_DISTANCE = 15; // Distance in pixels to trigger edge magnetism
  const SPACING_SNAP_OPTIONS = [10, 20, 30, 40]; // Common spacing values in pixels
  
  // Multi-selection mode
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  // Keyboard handler for Shift key (disable snap when held) and Ctrl for multi-select
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true);
      }
      if (e.key === 'Control' || e.key === 'Meta') {
        setIsMultiSelectMode(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false);
      }
      if (e.key === 'Control' || e.key === 'Meta') {
        setIsMultiSelectMode(false);
      }
    };

    if (isEditMode) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isEditMode]);

  const { data: tables = [], isLoading } = useQuery<Table[]>({
    queryKey: ['/api/tables/with-orders'],
    // Disable auto-refetch during edit mode to prevent conflicts with drag operations
    refetchInterval: isEditMode ? false : 5000,
  });

  const createTableMutation = useMutation({
    mutationFn: async (data: { number: number; capacity: number }) => {
      const response = await apiRequest('POST', '/api/tables', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
      toast({ title: 'Mesa criada com sucesso!' });
      setIsCreateOpen(false);
      setTableNumber('');
      setCapacity('4');
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao criar mesa', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const handleCreateTable = () => {
    const num = parseInt(tableNumber);
    const cap = parseInt(capacity);
    
    if (!num || num < 1) {
      toast({ title: 'Número da mesa inválido', variant: 'destructive' });
      return;
    }
    
    if (!cap || cap < 1) {
      toast({ title: 'Capacidade inválida', variant: 'destructive' });
      return;
    }
    
    createTableMutation.mutate({ number: num, capacity: cap });
  };

  const updateTablePositionMutation = useMutation({
    mutationFn: async ({ tableId, x, y }: { tableId: string; x: number; y: number }) => {
      const response = await apiRequest('PATCH', `/api/tables/${tableId}/position`, { x, y });
      return response.json();
    },
    // Optimistic update - update UI immediately without waiting for server
    onMutate: async ({ tableId, x, y }) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['/api/tables/with-orders'] });
      
      // Snapshot previous value
      const previousTables = queryClient.getQueryData(['/api/tables/with-orders']);
      
      // Optimistically update the cache
      queryClient.setQueryData(['/api/tables/with-orders'], (old: any) => {
        if (!old) return old;
        return old.map((table: Table) => 
          table.id === tableId 
            ? { ...table, positionX: x.toString(), positionY: y.toString() }
            : table
        );
      });
      
      return { previousTables };
    },
    onSuccess: () => {
      // Silently refetch in background to sync with server
      queryClient.invalidateQueries({ queryKey: ['/api/tables/with-orders'] });
    },
    onError: (error: any, variables, context) => {
      // Revert to previous state on error
      if (context?.previousTables) {
        queryClient.setQueryData(['/api/tables/with-orders'], context.previousTables);
      }
      toast({ 
        title: 'Erro ao atualizar posição', 
        description: error.message || 'Tente novamente',
        variant: 'destructive' 
      });
    },
  });

  const getTableStatus = (table: Table) => {
    if (table.status === 'disponivel') return 'available';
    if (table.status === 'ocupada') return 'occupied';
    if (table.status === 'aguardando_pagamento') return 'payment';
    return 'reserved';
  };

  const getStatusColor = (status: string) => {
    // Color themes for tables
    const themes = {
      default: {
        available: 'bg-green-500/20 border-green-500 hover:bg-green-500/30',
        occupied: 'bg-red-500/20 border-red-500 hover:bg-red-500/30',
        payment: 'bg-yellow-500/20 border-yellow-500 hover:bg-yellow-500/30',
        reserved: 'bg-blue-500/20 border-blue-500 hover:bg-blue-500/30',
      },
      modern: {
        available: 'bg-emerald-500/20 border-emerald-500 hover:bg-emerald-500/30',
        occupied: 'bg-rose-500/20 border-rose-500 hover:bg-rose-500/30',
        payment: 'bg-amber-500/20 border-amber-500 hover:bg-amber-500/30',
        reserved: 'bg-cyan-500/20 border-cyan-500 hover:bg-cyan-500/30',
      },
      elegant: {
        available: 'bg-teal-600/20 border-teal-600 hover:bg-teal-600/30',
        occupied: 'bg-purple-600/20 border-purple-600 hover:bg-purple-600/30',
        payment: 'bg-orange-600/20 border-orange-600 hover:bg-orange-600/30',
        reserved: 'bg-indigo-600/20 border-indigo-600 hover:bg-indigo-600/30',
      },
      vibrant: {
        available: 'bg-lime-500/25 border-lime-500 hover:bg-lime-500/35',
        occupied: 'bg-pink-500/25 border-pink-500 hover:bg-pink-500/35',
        payment: 'bg-yellow-400/25 border-yellow-400 hover:bg-yellow-400/35',
        reserved: 'bg-sky-500/25 border-sky-500 hover:bg-sky-500/35',
      },
      minimal: {
        available: 'bg-slate-200/30 border-slate-400 hover:bg-slate-200/40 dark:bg-slate-700/30 dark:border-slate-500',
        occupied: 'bg-slate-400/30 border-slate-600 hover:bg-slate-400/40 dark:bg-slate-600/30 dark:border-slate-400',
        payment: 'bg-slate-300/30 border-slate-500 hover:bg-slate-300/40 dark:bg-slate-650/30 dark:border-slate-450',
        reserved: 'bg-slate-350/30 border-slate-550 hover:bg-slate-350/40 dark:bg-slate-625/30 dark:border-slate-475',
      },
    };

    const currentTheme = themes[colorTheme];
    
    switch (status) {
      case 'available': return currentTheme.available;
      case 'occupied': return currentTheme.occupied;
      case 'payment': return currentTheme.payment;
      case 'reserved': return currentTheme.reserved;
      default: return 'bg-muted border-border';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Livre';
      case 'occupied': return 'Ocupada';
      case 'payment': return 'Aguardando';
      case 'reserved': return 'Reservada';
      default: return '';
    }
  };

  const handleTableClick = (table: Table) => {
    if (isEditMode && isMultiSelectMode) {
      // Multi-select mode
      setSelectedTableIds(prev => {
        if (prev.includes(table.id)) {
          return prev.filter(id => id !== table.id);
        } else {
          return [...prev, table.id];
        }
      });
    } else if (!isEditMode) {
      setSelectedTable(table);
      setDetailsDialogOpen(true);
    }
  };

  // Helper function to snap to grid
  const snapToGridPoint = (value: number, gridSize: number = 10): number => {
    // Snap to nearest grid point
    return Math.round(value / gridSize) * gridSize;
  };

  // Calculate alignment guides based on other tables
  const calculateAlignmentGuides = (
    currentTableId: string,
    currentX: number,
    currentY: number
  ) => {
    if (!tables) return { vertical: [], horizontal: [] };

    const verticalGuides: number[] = [];
    const horizontalGuides: number[] = [];

    // Get other tables (exclude current one)
    const otherTables = tables.filter(t => t.id !== currentTableId);

    otherTables.forEach(table => {
      const otherX = typeof table.positionX === 'number' ? table.positionX : 50;
      const otherY = typeof table.positionY === 'number' ? table.positionY : 50;

      // Check vertical alignment (X-axis)
      if (Math.abs(currentX - otherX) < ALIGNMENT_TOLERANCE) {
        verticalGuides.push(otherX);
      }

      // Check horizontal alignment (Y-axis)
      if (Math.abs(currentY - otherY) < ALIGNMENT_TOLERANCE) {
        horizontalGuides.push(otherY);
      }
    });

    // Remove duplicates and return
    return {
      vertical: Array.from(new Set(verticalGuides)),
      horizontal: Array.from(new Set(horizontalGuides))
    };
  };

  // Snap to alignment guides if close enough
  const snapToAlignmentGuides = (x: number, y: number, guides: { vertical: number[], horizontal: number[] }) => {
    let snappedX = x;
    let snappedY = y;

    // Snap to vertical guide (align X)
    if (guides.vertical.length > 0) {
      const closestVertical = guides.vertical.reduce((prev, curr) => 
        Math.abs(curr - x) < Math.abs(prev - x) ? curr : prev
      );
      if (Math.abs(closestVertical - x) < ALIGNMENT_TOLERANCE) {
        snappedX = closestVertical;
      }
    }

    // Snap to horizontal guide (align Y)
    if (guides.horizontal.length > 0) {
      const closestHorizontal = guides.horizontal.reduce((prev, curr) => 
        Math.abs(curr - y) < Math.abs(prev - y) ? curr : prev
      );
      if (Math.abs(closestHorizontal - y) < ALIGNMENT_TOLERANCE) {
        snappedY = closestHorizontal;
      }
    }

    return { x: snappedX, y: snappedY };
  };

  // Helper to get table dimensions based on capacity
  const getTableDimensions = (capacity: number) => {
    if (capacity <= 2) {
      return { width: 60, height: 60, shape: 'round' };
    } else if (capacity <= 4) {
      return { width: 80, height: 80, shape: 'square' };
    } else if (capacity <= 6) {
      return { width: 100, height: 80, shape: 'rectangle' };
    } else {
      return { width: 120, height: 90, shape: 'rectangle' };
    }
  };

  // Check if two tables collide (overlap)
  const checkCollision = (
    currentTableId: string,
    currentX: number, // percentage
    currentY: number, // percentage
    currentCapacity: number
  ) => {
    if (!tables || !floorPlanRef.current) return { hasCollision: false, collidingTables: [] };

    const container = floorPlanRef.current;
    const containerRect = container.getBoundingClientRect();
    const contentWidth = containerRect.width;
    const contentHeight = containerRect.height;

    const currentDims = getTableDimensions(currentCapacity);
    
    // Convert percentage position to pixel position (center point)
    const currentCenterXPx = (currentX / 100) * contentWidth;
    const currentCenterYPx = (currentY / 100) * contentHeight;
    
    // Calculate bounding box for current table
    const currentLeft = currentCenterXPx - currentDims.width / 2;
    const currentRight = currentCenterXPx + currentDims.width / 2;
    const currentTop = currentCenterYPx - currentDims.height / 2;
    const currentBottom = currentCenterYPx + currentDims.height / 2;

    const collidingTables: string[] = [];

    // Check collision with other tables
    const otherTables = tables.filter(t => t.id !== currentTableId);
    
    otherTables.forEach(table => {
      const otherX = typeof table.positionX === 'number' ? table.positionX : 50;
      const otherY = typeof table.positionY === 'number' ? table.positionY : 50;
      const otherDims = getTableDimensions(table.capacity);

      // Convert other table position to pixels
      const otherCenterXPx = (otherX / 100) * contentWidth;
      const otherCenterYPx = (otherY / 100) * contentHeight;

      // Calculate bounding box for other table
      const otherLeft = otherCenterXPx - otherDims.width / 2;
      const otherRight = otherCenterXPx + otherDims.width / 2;
      const otherTop = otherCenterYPx - otherDims.height / 2;
      const otherBottom = otherCenterYPx + otherDims.height / 2;

      // Check for overlap (AABB collision detection)
      const isOverlapping = !(
        currentRight < otherLeft ||
        currentLeft > otherRight ||
        currentBottom < otherTop ||
        currentTop > otherBottom
      );

      if (isOverlapping) {
        collidingTables.push(table.id);
      }
    });

    return {
      hasCollision: collidingTables.length > 0,
      collidingTables
    };
  };

  // Advanced magnetism - snap to edges and maintain spacing
  const applyEdgeMagnetism = (
    currentTableId: string,
    currentX: number, // percentage
    currentY: number, // percentage
    currentCapacity: number
  ): { x: number; y: number; snapped: boolean } => {
    if (!tables || !floorPlanRef.current) return { x: currentX, y: currentY, snapped: false };

    const container = floorPlanRef.current;
    const containerRect = container.getBoundingClientRect();
    const contentWidth = containerRect.width;
    const contentHeight = containerRect.height;

    const currentDims = getTableDimensions(currentCapacity);
    
    // Convert percentage position to pixel position
    let currentCenterXPx = (currentX / 100) * contentWidth;
    let currentCenterYPx = (currentY / 100) * contentHeight;
    
    const currentLeft = currentCenterXPx - currentDims.width / 2;
    const currentRight = currentCenterXPx + currentDims.width / 2;
    const currentTop = currentCenterYPx - currentDims.height / 2;
    const currentBottom = currentCenterYPx + currentDims.height / 2;

    let snappedX = false;
    let snappedY = false;

    // Check magnetism with other tables
    const otherTables = tables.filter(t => t.id !== currentTableId);
    
    for (const table of otherTables) {
      const otherX = typeof table.positionX === 'number' ? table.positionX : 50;
      const otherY = typeof table.positionY === 'number' ? table.positionY : 50;
      const otherDims = getTableDimensions(table.capacity);

      const otherCenterXPx = (otherX / 100) * contentWidth;
      const otherCenterYPx = (otherY / 100) * contentHeight;

      const otherLeft = otherCenterXPx - otherDims.width / 2;
      const otherRight = otherCenterXPx + otherDims.width / 2;
      const otherTop = otherCenterYPx - otherDims.height / 2;
      const otherBottom = otherCenterYPx + otherDims.height / 2;

      // Check horizontal edge magnetism (left-right, right-left)
      if (!snappedX) {
        // Snap current's left edge to other's right edge (with spacing)
        for (const spacing of SPACING_SNAP_OPTIONS) {
          const targetLeft = otherRight + spacing;
          if (Math.abs(currentLeft - targetLeft) < MAGNETISM_DISTANCE) {
            currentCenterXPx = targetLeft + currentDims.width / 2;
            snappedX = true;
            break;
          }
        }

        // Snap current's right edge to other's left edge (with spacing)
        if (!snappedX) {
          for (const spacing of SPACING_SNAP_OPTIONS) {
            const targetRight = otherLeft - spacing;
            if (Math.abs(currentRight - targetRight) < MAGNETISM_DISTANCE) {
              currentCenterXPx = targetRight - currentDims.width / 2;
              snappedX = true;
              break;
            }
          }
        }

        // Snap edges directly (no spacing)
        if (!snappedX) {
          if (Math.abs(currentLeft - otherRight) < MAGNETISM_DISTANCE) {
            currentCenterXPx = otherRight + currentDims.width / 2;
            snappedX = true;
          } else if (Math.abs(currentRight - otherLeft) < MAGNETISM_DISTANCE) {
            currentCenterXPx = otherLeft - currentDims.width / 2;
            snappedX = true;
          }
        }
      }

      // Check vertical edge magnetism (top-bottom, bottom-top)
      if (!snappedY) {
        // Snap current's top edge to other's bottom edge (with spacing)
        for (const spacing of SPACING_SNAP_OPTIONS) {
          const targetTop = otherBottom + spacing;
          if (Math.abs(currentTop - targetTop) < MAGNETISM_DISTANCE) {
            currentCenterYPx = targetTop + currentDims.height / 2;
            snappedY = true;
            break;
          }
        }

        // Snap current's bottom edge to other's top edge (with spacing)
        if (!snappedY) {
          for (const spacing of SPACING_SNAP_OPTIONS) {
            const targetBottom = otherTop - spacing;
            if (Math.abs(currentBottom - targetBottom) < MAGNETISM_DISTANCE) {
              currentCenterYPx = targetBottom - currentDims.height / 2;
              snappedY = true;
              break;
            }
          }
        }

        // Snap edges directly (no spacing)
        if (!snappedY) {
          if (Math.abs(currentTop - otherBottom) < MAGNETISM_DISTANCE) {
            currentCenterYPx = otherBottom + currentDims.height / 2;
            snappedY = true;
          } else if (Math.abs(currentBottom - otherTop) < MAGNETISM_DISTANCE) {
            currentCenterYPx = otherTop - currentDims.height / 2;
            snappedY = true;
          }
        }
      }

      if (snappedX && snappedY) break; // Both axes snapped, no need to check more tables
    }

    // Convert back to percentage
    const finalX = (currentCenterXPx / contentWidth) * 100;
    const finalY = (currentCenterYPx / contentHeight) * 100;

    return {
      x: finalX,
      y: finalY,
      snapped: snappedX || snappedY
    };
  };

  // Distribute tables evenly - horizontal
  const distributeHorizontally = () => {
    if (selectedTableIds.length < 3 || !tables) {
      toast({
        title: "Seleção Insuficiente",
        description: "Selecione pelo menos 3 mesas para distribuir horizontalmente.",
        variant: "destructive",
      });
      return;
    }

    const selectedTables = tables.filter(t => selectedTableIds.includes(t.id));
    
    // Sort by X position
    const sorted = [...selectedTables].sort((a, b) => {
      const aX = typeof a.positionX === 'number' ? a.positionX : 50;
      const bX = typeof b.positionX === 'number' ? b.positionX : 50;
      return aX - bX;
    });

    const leftMost = sorted[0];
    const rightMost = sorted[sorted.length - 1];
    const leftX = typeof leftMost.positionX === 'number' ? leftMost.positionX : 50;
    const rightX = typeof rightMost.positionX === 'number' ? rightMost.positionX : 50;

    // Calculate even spacing
    const totalSpace = rightX - leftX;
    const spacing = totalSpace / (sorted.length - 1);

    // Update positions
    sorted.forEach((table, index) => {
      if (index === 0 || index === sorted.length - 1) return; // Keep first and last
      
      const newX = leftX + (spacing * index);
      const currentY = typeof table.positionY === 'number' ? table.positionY : 50;
      
      updateTablePositionMutation.mutate({
        tableId: table.id,
        x: Math.round(newX * 100) / 100,
        y: Math.round(currentY * 100) / 100
      });
    });

    toast({
      title: "✅ Distribuição Horizontal Concluída",
      description: `${sorted.length} mesas distribuídas uniformemente.`,
    });
  };

  // Distribute tables evenly - vertical
  const distributeVertically = () => {
    if (selectedTableIds.length < 3 || !tables) {
      toast({
        title: "Seleção Insuficiente",
        description: "Selecione pelo menos 3 mesas para distribuir verticalmente.",
        variant: "destructive",
      });
      return;
    }

    const selectedTables = tables.filter(t => selectedTableIds.includes(t.id));
    
    // Sort by Y position
    const sorted = [...selectedTables].sort((a, b) => {
      const aY = typeof a.positionY === 'number' ? a.positionY : 50;
      const bY = typeof b.positionY === 'number' ? b.positionY : 50;
      return aY - bY;
    });

    const topMost = sorted[0];
    const bottomMost = sorted[sorted.length - 1];
    const topY = typeof topMost.positionY === 'number' ? topMost.positionY : 50;
    const bottomY = typeof bottomMost.positionY === 'number' ? bottomMost.positionY : 50;

    // Calculate even spacing
    const totalSpace = bottomY - topY;
    const spacing = totalSpace / (sorted.length - 1);

    // Update positions
    sorted.forEach((table, index) => {
      if (index === 0 || index === sorted.length - 1) return; // Keep first and last
      
      const newY = topY + (spacing * index);
      const currentX = typeof table.positionX === 'number' ? table.positionX : 50;
      
      updateTablePositionMutation.mutate({
        tableId: table.id,
        x: Math.round(currentX * 100) / 100,
        y: Math.round(newY * 100) / 100
      });
    });

    toast({
      title: "✅ Distribuição Vertical Concluída",
      description: `${sorted.length} mesas distribuídas uniformemente.`,
    });
  };

  // Align selected tables
  const alignTables = (direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedTableIds.length < 2 || !tables) {
      toast({
        title: "Seleção Insuficiente",
        description: "Selecione pelo menos 2 mesas para alinhar.",
        variant: "destructive",
      });
      return;
    }

    const selectedTables = tables.filter(t => selectedTableIds.includes(t.id));

    if (direction === 'left' || direction === 'center' || direction === 'right') {
      // Horizontal alignment
      let targetX: number;
      
      if (direction === 'left') {
        const leftMost = Math.min(...selectedTables.map(t => 
          typeof t.positionX === 'number' ? t.positionX : 50
        ));
        targetX = leftMost;
      } else if (direction === 'right') {
        const rightMost = Math.max(...selectedTables.map(t => 
          typeof t.positionX === 'number' ? t.positionX : 50
        ));
        targetX = rightMost;
      } else { // center
        const positions = selectedTables.map(t => 
          typeof t.positionX === 'number' ? t.positionX : 50
        );
        targetX = positions.reduce((a, b) => a + b, 0) / positions.length;
      }

      selectedTables.forEach(table => {
        const currentY = typeof table.positionY === 'number' ? table.positionY : 50;
        updateTablePositionMutation.mutate({
          tableId: table.id,
          x: Math.round(targetX * 100) / 100,
          y: Math.round(currentY * 100) / 100
        });
      });
    } else {
      // Vertical alignment
      let targetY: number;
      
      if (direction === 'top') {
        const topMost = Math.min(...selectedTables.map(t => 
          typeof t.positionY === 'number' ? t.positionY : 50
        ));
        targetY = topMost;
      } else if (direction === 'bottom') {
        const bottomMost = Math.max(...selectedTables.map(t => 
          typeof t.positionY === 'number' ? t.positionY : 50
        ));
        targetY = bottomMost;
      } else { // middle
        const positions = selectedTables.map(t => 
          typeof t.positionY === 'number' ? t.positionY : 50
        );
        targetY = positions.reduce((a, b) => a + b, 0) / positions.length;
      }

      selectedTables.forEach(table => {
        const currentX = typeof table.positionX === 'number' ? table.positionX : 50;
        updateTablePositionMutation.mutate({
          tableId: table.id,
          x: Math.round(currentX * 100) / 100,
          y: Math.round(targetY * 100) / 100
        });
      });
    }

    toast({
      title: "✅ Alinhamento Concluído",
      description: `${selectedTables.length} mesas alinhadas.`,
    });
  };

  const handleDrag = (tableId: string, event: any, info: any) => {
    if (!isEditMode || !floorPlanRef.current) return;

    const container = floorPlanRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // Get the current element position during drag
    const element = event.target as HTMLElement;
    const elementRect = element.getBoundingClientRect();
    
    // Calculate padding dynamically from computed styles
    const computedStyle = window.getComputedStyle(container);
    const paddingLeft = parseFloat(computedStyle.paddingLeft);
    const paddingTop = parseFloat(computedStyle.paddingTop);
    const paddingRight = parseFloat(computedStyle.paddingRight);
    const paddingBottom = parseFloat(computedStyle.paddingBottom);
    
    // Calculate center position relative to container's content area
    const centerX = elementRect.left + elementRect.width / 2 - containerRect.left - paddingLeft;
    const centerY = elementRect.top + elementRect.height / 2 - containerRect.top - paddingTop;
    
    // Content area dimensions
    const contentWidth = containerRect.width - paddingLeft - paddingRight;
    const contentHeight = containerRect.height - paddingTop - paddingBottom;
    
    // Convert to percentage (0-100)
    let x = Math.max(0, Math.min(100, (centerX / contentWidth) * 100));
    let y = Math.max(0, Math.min(100, (centerY / contentHeight) * 100));
    
    // Calculate alignment guides based on current position
    const guides = calculateAlignmentGuides(tableId, x, y);
    setAlignmentGuides(guides);
    
    // Apply snap to grid for preview (if enabled)
    const shouldSnap = snapToGrid && !isShiftPressed;
    if (shouldSnap) {
      x = snapToGridPoint(x, 10);
      y = snapToGridPoint(y, 10);
    }
    
    // Apply smart guides alignment (takes priority over grid snap)
    const snapped = snapToAlignmentGuides(x, y, guides);
    x = snapped.x;
    y = snapped.y;
    
    // Apply edge magnetism (works alongside other snapping)
    const draggedTable = tables.find(t => t.id === tableId);
    if (draggedTable && draggedTable.capacity) {
      const magnetism = applyEdgeMagnetism(tableId, x, y, draggedTable.capacity);
      setMagnetismActive(magnetism.snapped);
      if (magnetism.snapped) {
        x = magnetism.x;
        y = magnetism.y;
      }
      
      // Check for collisions
      const collision = checkCollision(tableId, x, y, draggedTable.capacity);
      setHasCollision(collision.hasCollision);
      setCollisionTableIds(collision.collidingTables);
    }
    
    // Update preview position
    setDragPreviewPosition({ x, y });
  };

  const handleDragEnd = (tableId: string, event: any, info: any) => {
    if (!isEditMode || !floorPlanRef.current) return;

    const container = floorPlanRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // Get the current element position after drag
    const element = event.target as HTMLElement;
    const elementRect = element.getBoundingClientRect();
    
    // Calculate padding dynamically from computed styles (responsive & theme-safe)
    const computedStyle = window.getComputedStyle(container);
    const paddingLeft = parseFloat(computedStyle.paddingLeft);
    const paddingTop = parseFloat(computedStyle.paddingTop);
    const paddingRight = parseFloat(computedStyle.paddingRight);
    const paddingBottom = parseFloat(computedStyle.paddingBottom);
    
    // Calculate center position relative to container's content area (excluding padding)
    const centerX = elementRect.left + elementRect.width / 2 - containerRect.left - paddingLeft;
    const centerY = elementRect.top + elementRect.height / 2 - containerRect.top - paddingTop;
    
    // Content area dimensions (excluding padding on both sides)
    const contentWidth = containerRect.width - paddingLeft - paddingRight;
    const contentHeight = containerRect.height - paddingTop - paddingBottom;
    
    // Convert to percentage (0-100) based on content area
    let x = Math.max(0, Math.min(100, (centerX / contentWidth) * 100));
    let y = Math.max(0, Math.min(100, (centerY / contentHeight) * 100));
    
    // Calculate final alignment guides
    const guides = calculateAlignmentGuides(tableId, x, y);
    
    // Apply snap to grid if enabled and Shift is not pressed
    const shouldSnap = snapToGrid && !isShiftPressed;
    if (shouldSnap) {
      x = snapToGridPoint(x, 10); // 10% grid
      y = snapToGridPoint(y, 10);
    }
    
    // Apply smart guides alignment (takes priority)
    const snapped = snapToAlignmentGuides(x, y, guides);
    x = snapped.x;
    y = snapped.y;
    
    // Apply edge magnetism (final positioning)
    const draggedTable = tables.find(t => t.id === tableId);
    if (draggedTable && draggedTable.capacity) {
      const magnetism = applyEdgeMagnetism(tableId, x, y, draggedTable.capacity);
      if (magnetism.snapped) {
        x = magnetism.x;
        y = magnetism.y;
      }
      
      // Final collision check
      const collision = checkCollision(tableId, x, y, draggedTable.capacity);
      
      if (collision.hasCollision) {
        // Show warning toast
        toast({
          title: "⚠️ Sobreposição Detectada",
          description: "A mesa foi posicionada sobre outra mesa. Por favor, reposicione-a.",
          variant: "destructive",
        });
        
        // Still save the position (allow it) but warn the user
      }
    }
    
    // Round to 2 decimal places
    updateTablePositionMutation.mutate({ 
      tableId, 
      x: Math.round(x * 100) / 100, 
      y: Math.round(y * 100) / 100 
    });

    // Clear drag state
    setDraggedTableId(null);
    setDragPreviewPosition(null);
    setAlignmentGuides({ vertical: [], horizontal: [] });
    setHasCollision(false);
    setCollisionTableIds([]);
    setMagnetismActive(false);
  };

  const filteredTables = tables.filter(table => 
    !searchQuery || 
    table.number.toString().includes(searchQuery) ||
    table.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: tables.length,
    occupied: tables.filter(t => t.status === 'ocupada').length,
    available: tables.filter(t => t.status === 'disponivel').length,
    payment: tables.filter(t => t.status === 'aguardando_pagamento').length,
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="h-32 animate-pulse bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Planta do Restaurante</h2>
            <Badge variant="secondary">{filteredTables.length} mesas</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            🔵 Redonda (≤2) • ⬜ Quadrada (3-4) • ▭ Retangular (5+)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Nova Mesa Button */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="shadow-md">
                <Plus className="h-4 w-4 mr-2" weight="bold" />
                Nova Mesa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Mesa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="table-number">Número da Mesa</Label>
                  <Input
                    id="table-number"
                    type="number"
                    placeholder="Ex: 1"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidade (pessoas)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="Ex: 4"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    min="1"
                  />
                </div>
                <Button 
                  onClick={handleCreateTable}
                  disabled={createTableMutation.isPending}
                  className="w-full"
                >
                  {createTableMutation.isPending ? 'Criando...' : 'Criar Mesa'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" weight="bold" />
            <Input
              placeholder="Buscar mesa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-48"
            />
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'floor' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('floor')}
            >
              <GridIcon className="h-4 w-4" weight="duotone" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <ListIcon className="h-4 w-4" weight="duotone" />
            </Button>
          </div>

          {/* Color theme selector */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Palette className="h-4 w-4 mr-2" weight="duotone" />
                Tema
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Escolher Tema de Cores</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-3 py-4">
                {/* Default Theme */}
                <div
                  onClick={() => setColorTheme('default')}
                  className={cn(
                    "p-4 border-2 rounded-lg cursor-pointer transition-all hover:scale-105",
                    colorTheme === 'default' ? 'border-primary ring-2 ring-primary' : 'border-border'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Padrão</span>
                    {colorTheme === 'default' && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">Ativo</span>}
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded bg-green-500/20 border-2 border-green-500"></div>
                    <div className="h-8 w-8 rounded bg-red-500/20 border-2 border-red-500"></div>
                    <div className="h-8 w-8 rounded bg-yellow-500/20 border-2 border-yellow-500"></div>
                    <div className="h-8 w-8 rounded bg-blue-500/20 border-2 border-blue-500"></div>
                  </div>
                </div>

                {/* Modern Theme */}
                <div
                  onClick={() => setColorTheme('modern')}
                  className={cn(
                    "p-4 border-2 rounded-lg cursor-pointer transition-all hover:scale-105",
                    colorTheme === 'modern' ? 'border-primary ring-2 ring-primary' : 'border-border'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Moderno</span>
                    {colorTheme === 'modern' && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">Ativo</span>}
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded bg-emerald-500/20 border-2 border-emerald-500"></div>
                    <div className="h-8 w-8 rounded bg-rose-500/20 border-2 border-rose-500"></div>
                    <div className="h-8 w-8 rounded bg-amber-500/20 border-2 border-amber-500"></div>
                    <div className="h-8 w-8 rounded bg-cyan-500/20 border-2 border-cyan-500"></div>
                  </div>
                </div>

                {/* Elegant Theme */}
                <div
                  onClick={() => setColorTheme('elegant')}
                  className={cn(
                    "p-4 border-2 rounded-lg cursor-pointer transition-all hover:scale-105",
                    colorTheme === 'elegant' ? 'border-primary ring-2 ring-primary' : 'border-border'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Elegante</span>
                    {colorTheme === 'elegant' && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">Ativo</span>}
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded bg-teal-600/20 border-2 border-teal-600"></div>
                    <div className="h-8 w-8 rounded bg-purple-600/20 border-2 border-purple-600"></div>
                    <div className="h-8 w-8 rounded bg-orange-600/20 border-2 border-orange-600"></div>
                    <div className="h-8 w-8 rounded bg-indigo-600/20 border-2 border-indigo-600"></div>
                  </div>
                </div>

                {/* Vibrant Theme */}
                <div
                  onClick={() => setColorTheme('vibrant')}
                  className={cn(
                    "p-4 border-2 rounded-lg cursor-pointer transition-all hover:scale-105",
                    colorTheme === 'vibrant' ? 'border-primary ring-2 ring-primary' : 'border-border'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Vibrante</span>
                    {colorTheme === 'vibrant' && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">Ativo</span>}
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded bg-lime-500/25 border-2 border-lime-500"></div>
                    <div className="h-8 w-8 rounded bg-pink-500/25 border-2 border-pink-500"></div>
                    <div className="h-8 w-8 rounded bg-yellow-400/25 border-2 border-yellow-400"></div>
                    <div className="h-8 w-8 rounded bg-sky-500/25 border-2 border-sky-500"></div>
                  </div>
                </div>

                {/* Minimal Theme */}
                <div
                  onClick={() => setColorTheme('minimal')}
                  className={cn(
                    "p-4 border-2 rounded-lg cursor-pointer transition-all hover:scale-105",
                    colorTheme === 'minimal' ? 'border-primary ring-2 ring-primary' : 'border-border'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Minimalista</span>
                    {colorTheme === 'minimal' && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">Ativo</span>}
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded bg-slate-200/30 border-2 border-slate-400"></div>
                    <div className="h-8 w-8 rounded bg-slate-400/30 border-2 border-slate-600"></div>
                    <div className="h-8 w-8 rounded bg-slate-300/30 border-2 border-slate-500"></div>
                    <div className="h-8 w-8 rounded bg-slate-350/30 border-2 border-slate-550"></div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit mode toggle */}
          <Button
            variant={isEditMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
          >
            <Gear className="h-4 w-4 mr-2" weight="duotone" />
            {isEditMode ? 'Salvar Layout' : 'Editar Layout'}
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Livres</p>
                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <UsersThree className="h-5 w-5 text-green-600" weight="duotone" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ocupadas</p>
                <p className="text-2xl font-bold text-red-600">{stats.occupied}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <ClockIcon className="h-5 w-5 text-red-600" weight="duotone" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pagamento</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.payment}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-yellow-600" weight="duotone" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <GridIcon className="h-5 w-5 text-primary" weight="duotone" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floor plan view */}
      {viewMode === 'floor' ? (
        <Card className="relative overflow-hidden">
          <CardContent className="p-0">
            <div
              ref={floorPlanRef}
              className="relative w-full h-[600px] bg-gradient-to-br from-muted/50 to-background p-8 border-8 border-border/30 rounded-lg"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)',
              }}
            >
              {isEditMode && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col gap-2 items-center max-w-[90%]">
                  <Badge variant="secondary" className="shadow-lg animate-pulse">
                    🖱️ Arraste as mesas para reposicionar
                  </Badge>
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <Badge 
                      variant={snapToGrid ? "default" : "outline"} 
                      className="shadow-md cursor-pointer transition-all hover:scale-105"
                      onClick={() => setSnapToGrid(!snapToGrid)}
                    >
                      {snapToGrid ? '🧲 Snap: ON' : '🧲 Snap: OFF'}
                    </Badge>
                    {isShiftPressed && (
                      <Badge variant="secondary" className="shadow-md animate-pulse">
                        ⇧ Movimento Livre
                      </Badge>
                    )}
                    {isMultiSelectMode && (
                      <Badge variant="default" className="shadow-md animate-pulse bg-green-500 hover:bg-green-600">
                        ✓ Seleção Múltipla ({selectedTableIds.length})
                      </Badge>
                    )}
                    {(alignmentGuides.vertical.length > 0 || alignmentGuides.horizontal.length > 0) && !hasCollision && !magnetismActive && (
                      <Badge variant="default" className="shadow-md animate-pulse bg-orange-500 hover:bg-orange-600">
                        📏 Alinhado!
                      </Badge>
                    )}
                    {magnetismActive && !hasCollision && (
                      <Badge variant="default" className="shadow-md animate-pulse bg-purple-500 hover:bg-purple-600">
                        🧲 Magnetismo!
                      </Badge>
                    )}
                    {hasCollision && (
                      <Badge variant="destructive" className="shadow-md animate-pulse">
                        ⚠️ Sobreposição!
                      </Badge>
                    )}
                  </div>
                  
                  {/* Multi-select tools */}
                  {isEditMode && selectedTableIds.length >= 2 && (
                    <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-xl p-3 flex flex-col gap-2">
                      <div className="text-xs font-semibold text-muted-foreground text-center mb-1">
                        Ferramentas de Grupo ({selectedTableIds.length} mesas)
                      </div>
                      
                      <div className="flex gap-2 flex-wrap justify-center">
                        {/* Alignment buttons */}
                        <div className="flex gap-1 items-center border-r pr-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => alignTables('left')}
                            title="Alinhar à Esquerda"
                            className="h-8 w-8 p-0"
                          >
                            <AlignLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => alignTables('center')}
                            title="Alinhar ao Centro (Horizontal)"
                            className="h-8 w-8 p-0"
                          >
                            <AlignCenterHorizontal className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => alignTables('right')}
                            title="Alinhar à Direita"
                            className="h-8 w-8 p-0"
                          >
                            <AlignRight className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex gap-1 items-center border-r pr-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => alignTables('top')}
                            title="Alinhar ao Topo"
                            className="h-8 w-8 p-0"
                          >
                            <AlignTop className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => alignTables('middle')}
                            title="Alinhar ao Meio (Vertical)"
                            className="h-8 w-8 p-0"
                          >
                            <AlignCenterVertical className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => alignTables('bottom')}
                            title="Alinhar ao Fundo"
                            className="h-8 w-8 p-0"
                          >
                            <AlignBottom className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Distribution buttons */}
                        {selectedTableIds.length >= 3 && (
                          <div className="flex gap-1 items-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={distributeHorizontally}
                              title="Distribuir Horizontalmente"
                              className="h-8 px-2"
                            >
                              <ArrowsHorizontal className="h-4 w-4 mr-1" />
                              <span className="text-xs">H</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={distributeVertically}
                              title="Distribuir Verticalmente"
                              className="h-8 px-2"
                            >
                              <ArrowsVertical className="h-4 w-4 mr-1" />
                              <span className="text-xs">V</span>
                            </Button>
                          </div>
                        )}
                        
                        {/* Clear selection */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedTableIds([])}
                          title="Limpar Seleção"
                          className="h-8 px-2 text-xs"
                        >
                          Limpar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Guide grid when in edit mode - CSS only, no DOM elements */}
              {isEditMode && (
                <div 
                  className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, ${snapToGrid ? 'rgba(59, 130, 246, 0.3)' : 'rgba(0,0,0,0.15)'} 1px, transparent 1px),
                      linear-gradient(to bottom, ${snapToGrid ? 'rgba(59, 130, 246, 0.3)' : 'rgba(0,0,0,0.15)'} 1px, transparent 1px)
                    `,
                    backgroundSize: '10% 10%',
                    opacity: snapToGrid ? 0.4 : 0.2,
                  }}
                />
              )}

              {/* Smart Alignment Guides - Visual lines */}
              {isEditMode && draggedTableId && (
                <>
                  {/* Vertical guides (X-axis alignment) */}
                  {alignmentGuides.vertical.map((x, index) => (
                    <motion.div
                      key={`v-${index}-${x}`}
                      initial={{ opacity: 0, scaleY: 0 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      exit={{ opacity: 0, scaleY: 0 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-orange-500 to-transparent pointer-events-none z-[95]"
                      style={{
                        left: `${x}%`,
                        boxShadow: '0 0 10px rgba(249, 115, 22, 0.8)',
                      }}
                    >
                      {/* Arrow indicators at top and bottom */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-orange-500" />
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-orange-500" />
                    </motion.div>
                  ))}

                  {/* Horizontal guides (Y-axis alignment) */}
                  {alignmentGuides.horizontal.map((y, index) => (
                    <motion.div
                      key={`h-${index}-${y}`}
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent pointer-events-none z-[95]"
                      style={{
                        top: `${y}%`,
                        boxShadow: '0 0 10px rgba(249, 115, 22, 0.8)',
                      }}
                    >
                      {/* Arrow indicators at left and right */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-orange-500" />
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-orange-500" />
                    </motion.div>
                  ))}
                </>
              )}

              <AnimatePresence>
                {filteredTables.map((table, index) => {
                  const status = getTableStatus(table);
                  // Parse positions from database (they come as strings)
                  // If no position saved, use deterministic grid-based layout
                  const hasPosition = table.positionX !== null && table.positionY !== null;
                  const defaultPos = hasPosition ? null : getDefaultPosition(table.id, index, filteredTables.length);
                  const x = hasPosition ? parseFloat(table.positionX!.toString()) : defaultPos!.x;
                  const y = hasPosition ? parseFloat(table.positionY!.toString()) : defaultPos!.y;
                  const shape = getTableShape(table.capacity);
                  const dimensions = getTableDimensions(shape, table.capacity);

                  return (
                    <>
                      {/* Snap Preview - show where table will snap to */}
                      {draggedTableId === table.id && dragPreviewPosition && (
                        <>
                          {/* Preview outline */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            style={{
                              position: 'absolute',
                              left: `${dragPreviewPosition.x}%`,
                              top: `${dragPreviewPosition.y}%`,
                              transform: 'translate(-50%, -50%)',
                              width: `${dimensions.width}px`,
                              height: `${dimensions.height}px`,
                              borderRadius: dimensions.borderRadius,
                              pointerEvents: 'none',
                            }}
                            className={cn(
                              "border-4 border-dashed backdrop-blur-sm z-[90]",
                              hasCollision 
                                ? "border-red-500 bg-red-500/20" 
                                : "border-blue-500 bg-blue-500/10"
                            )}
                          />
                          
                          {/* Coordinates tooltip above preview */}
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            style={{
                              position: 'absolute',
                              left: `${dragPreviewPosition.x}%`,
                              top: `${dragPreviewPosition.y}%`,
                              transform: 'translate(-50%, calc(-50% - 80px))',
                              pointerEvents: 'none',
                              zIndex: 95,
                            }}
                            className="flex flex-col items-center gap-1"
                          >
                            <div className={cn(
                              "px-3 py-1.5 rounded-lg shadow-lg font-mono text-xs font-bold whitespace-nowrap",
                              hasCollision 
                                ? "bg-red-500 text-white" 
                                : "bg-blue-500 text-white"
                            )}>
                              {hasCollision && "⚠️ "}
                              X: {dragPreviewPosition.x.toFixed(1)}% • Y: {dragPreviewPosition.y.toFixed(1)}%
                            </div>
                            {/* Arrow pointing down */}
                            <div className={cn(
                              "w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px]",
                              hasCollision ? "border-t-red-500" : "border-t-blue-500"
                            )} />
                          </motion.div>
                        </>
                      )}

                      <motion.div
                        key={table.id}
                        drag={isEditMode}
                        dragMomentum={false}
                        dragElastic={0}
                        dragConstraints={floorPlanRef}
                        dragTransition={{ power: 0, timeConstant: 0 }}
                        onDragStart={() => setDraggedTableId(table.id)}
                        onDrag={(event, info) => handleDrag(table.id, event, info)}
                        onDragEnd={(event, info) => handleDragEnd(table.id, event, info)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ 
                          opacity: draggedTableId && draggedTableId !== table.id ? 0.3 : 1,
                          scale: 1,
                          x: 0,
                          y: 0,
                          transition: { type: "spring", stiffness: 500, damping: 50 }
                        }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: isEditMode ? 1 : 1.05, zIndex: 50 }}
                        whileTap={{ scale: 0.95 }}
                        whileDrag={{ 
                          scale: 1.1, 
                          zIndex: 100, 
                          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                          cursor: 'grabbing'
                        }}
                        style={{
                          position: 'absolute',
                          left: `${x}%`,
                          top: `${y}%`,
                          transform: 'translate(-50%, -50%)',
                          width: `${dimensions.width}px`,
                          height: `${dimensions.height}px`,
                          borderRadius: dimensions.borderRadius,
                        }}
                        className={cn(
                          'border-2 cursor-pointer transition-all duration-200',
                          'flex flex-col items-center justify-center gap-0.5 p-1.5 overflow-hidden',
                          'shadow-lg backdrop-blur-sm',
                          getStatusColor(status),
                          isEditMode && 'cursor-move',
                          draggedTableId === table.id && !hasCollision && 'ring-4 ring-blue-500 ring-opacity-50',
                          draggedTableId === table.id && hasCollision && 'ring-4 ring-red-500 ring-opacity-70 animate-pulse',
                          collisionTableIds.includes(table.id) && 'ring-4 ring-red-500 ring-opacity-50',
                          selectedTableIds.includes(table.id) && 'ring-4 ring-green-500 ring-opacity-70',
                          // Add shape indicator classes
                          shape === 'round' && 'relative before:absolute before:inset-2 before:border before:border-dashed before:border-current before:rounded-full before:opacity-20',
                          shape === 'rectangle' && 'relative before:absolute before:inset-2 before:border before:border-dashed before:border-current before:rounded before:opacity-20'
                        )}
                        onClick={() => handleTableClick(table)}
                      >
                      {/* Table number - compact */}
                      <div className="flex items-center justify-center w-full">
                        <span className="font-bold text-sm truncate">#{table.number}</span>
                      </div>

                      {/* Status badge - very compact */}
                      <Badge variant="secondary" className="text-[8px] py-0 px-1 h-3.5 max-w-full">
                        <span className="truncate">{getStatusLabel(status)}</span>
                      </Badge>

                      {/* Guest count & Total - ultra compact */}
                      <div className="flex flex-col gap-0.5 w-full items-center">
                        {table.guestCount !== null && table.guestCount > 0 && (
                          <div className="flex items-center gap-0.5 text-[9px]">
                            <UsersThree className="h-2.5 w-2.5" weight="fill" />
                            <span className="font-medium">{table.guestCount}</span>
                          </div>
                        )}

                        {/* Total amount - compact with background */}
                        {table.totalAmount && parseFloat(table.totalAmount) > 0 && (
                          <div className="flex items-center justify-center gap-0.5 text-[8px] font-bold bg-background/50 rounded px-1 py-0.5 w-full max-w-full">
                            <CurrencyCircleDollar className="h-2.5 w-2.5 flex-shrink-0" weight="fill" />
                            <span className="font-mono truncate">{formatKwanza(table.totalAmount, false)}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                    </>
                  );
                })}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Grid view fallback */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredTables.map((table) => {
            const status = getTableStatus(table);
            return (
              <motion.div
                key={table.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className={cn(
                    'border-2 cursor-pointer transition-all',
                    getStatusColor(status)
                  )}
                  onClick={() => handleTableClick(table)}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UsersThree className="h-5 w-5" weight="duotone" />
                        <span className="font-bold">Mesa {table.number}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {getStatusLabel(status)}
                      </Badge>
                    </div>

                    {table.guestCount !== null && table.guestCount > 0 && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <UsersThree className="h-4 w-4" weight="fill" />
                        <span>{table.guestCount} {table.guestCount === 1 ? 'pessoa' : 'pessoas'}</span>
                      </div>
                    )}

                    {table.totalAmount && parseFloat(table.totalAmount) > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Total:</span>
                        <span className="font-bold font-mono">{formatKwanza(table.totalAmount)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Table details dialog */}
      {selectedTable && (
        <TableDetailsDialog
          table={selectedTable}
          open={detailsDialogOpen}
          onOpenChange={(open) => {
            setDetailsDialogOpen(open);
            if (!open) setSelectedTable(null);
          }}
        />
      )}
    </div>
  );
}
