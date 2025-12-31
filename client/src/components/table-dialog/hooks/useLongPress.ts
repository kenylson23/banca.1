import { useCallback, useRef } from 'react';

interface LongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  delay?: number;
}

export function useLongPress(options: LongPressOptions) {
  const { onLongPress, onClick, delay = 500 } = options;
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isLongPressRef = useRef(false);

  const start = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    // Prevent default to avoid context menu on mobile
    event.preventDefault();
    
    isLongPressRef.current = false;
    
    // Haptic feedback on touch start
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }

    timeoutRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress();
      
      // Stronger haptic feedback for long press
      if ('vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
    }, delay);
  }, [onLongPress, delay]);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const handleClick = useCallback(() => {
    if (!isLongPressRef.current && onClick) {
      onClick();
    }
    isLongPressRef.current = false;
  }, [onClick]);

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchEnd: clear,
    onClick: handleClick,
  };
}
