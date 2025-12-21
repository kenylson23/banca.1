import { useDroppable } from '@dnd-kit/core';
import { ReactNode } from 'react';

interface DroppableGuestZoneProps {
  guestId: string;
  children: ReactNode;
  disabled?: boolean;
}

export function DroppableGuestZone({
  guestId,
  children,
  disabled = false,
}: DroppableGuestZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: guestId,
    data: {
      guestId,
    },
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-[100px] p-2 rounded-lg border-2 transition-all
        ${isOver && !disabled ? 'border-primary bg-primary/5 shadow-inner' : 'border-transparent'}
        ${disabled ? 'opacity-50' : ''}
      `}
    >
      {children}
    </div>
  );
}
