import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';

interface DraggableOrderItemProps {
  id: string;
  menuItemName: string;
  quantity: number;
  totalPrice: string;
  guestId: string;
  disabled?: boolean;
}

export function DraggableOrderItem({
  id,
  menuItemName,
  quantity,
  totalPrice,
  guestId,
  disabled = false,
}: DraggableOrderItemProps) {
  
  // 🔍 DEBUG: Ver dados do item
  console.log('🎯 DraggableOrderItem:', { 
    menuItemName, 
    quantity, 
    totalPrice, 
    disabled,
    formatted: formatKwanza(totalPrice)
  });
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    data: {
      itemId: id,
      sourceGuestId: guestId,
      menuItemName,
      quantity,
      totalPrice,
    },
    disabled,
  });

  console.log('🔵 [Draggable] Item renderizado:', { 
    id, 
    menuItemName, 
    guestId, 
    disabled,
    isDragging,
    hasListeners: !!listeners,
    listenersKeys: listeners ? Object.keys(listeners) : []
  });

  // Criar listeners customizados com log
  const customListeners = listeners ? {
    ...listeners,
    onPointerDown: (e: React.PointerEvent) => {
      console.log('👆 [Draggable] onPointerDown capturado!', { 
        id, 
        menuItemName,
        target: e.target 
      });
      if (listeners.onPointerDown) {
        listeners.onPointerDown(e as any);
      }
    },
  } : undefined;

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: disabled ? 'default' : 'grab',
    touchAction: 'none', // Importante para touch devices
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center justify-between text-sm py-2 px-2 rounded
        ${isDragging ? 'bg-primary/10 shadow-lg' : 'hover:bg-muted/50'}
        ${disabled ? 'opacity-50' : ''}
        transition-colors
      `}
      {...attributes}
      {...customListeners}
    >
      <div className="flex items-center gap-2 flex-1">
        {!disabled && (
          <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
        <span className="text-muted-foreground">
          {quantity}x {menuItemName}
        </span>
      </div>
      <span className="font-medium ml-2">{formatKwanza(totalPrice)}</span>
    </div>
  );
}
