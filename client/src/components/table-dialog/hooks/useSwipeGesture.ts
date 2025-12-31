import { useEffect, useRef, useState } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}

export function useSwipeGesture(options: SwipeGestureOptions) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
  } = options;

  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    
    setDragOffset({
      x: currentX - touchStartX.current,
      y: currentY - touchStartY.current,
    });
  };

  const handleTouchEnd = () => {
    const deltaX = dragOffset.x;
    const deltaY = dragOffset.y;

    // Horizontal swipe (prioritize if more horizontal than vertical)
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > threshold && onSwipeRight) {
        onSwipeRight();
        triggerHaptic();
      } else if (deltaX < -threshold && onSwipeLeft) {
        onSwipeLeft();
        triggerHaptic();
      }
    } else {
      // Vertical swipe
      if (deltaY > threshold && onSwipeDown) {
        onSwipeDown();
        triggerHaptic();
      } else if (deltaY < -threshold && onSwipeUp) {
        onSwipeUp();
        triggerHaptic();
      }
    }

    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  const triggerHaptic = () => {
    // Vibration API for haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10); // Short vibration
    }
  };

  return {
    isDragging,
    dragOffset,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
