import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform, useMotionValue, animate } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}

export function AnimatedCounter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
  duration = 1.5,
}: AnimatedCounterProps) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => {
    // Ensure latest is a number before calling toFixed
    const numericValue = typeof latest === 'number' ? latest : parseFloat(String(latest)) || 0;
    return prefix + numericValue.toFixed(decimals) + suffix;
  });

  const prevValue = useRef(0);

  useEffect(() => {
    // Ensure value is a valid number
    const numericValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    
    const controls = animate(motionValue, numericValue, {
      duration,
      ease: "easeOut",
    });

    prevValue.current = numericValue;
    
    return controls.stop;
  }, [value, motionValue, duration]);

  return (
    <motion.span className={className}>
      {rounded}
    </motion.span>
  );
}
